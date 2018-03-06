package routers

import (
	"github.com/labstack/echo"
	"github.com/iota-tangle-io/dtlg/backend/controllers"
	"github.com/gorilla/websocket"
	"time"
	"net/http"
	"fmt"
)

var (
	upgrader = websocket.Upgrader{}
)

type SpammerRouter struct {
	WebEngine      *echo.Echo               `inject:""`
	Ctrl           *controllers.SpammerCtrl `inject:""`
	ShutdownSignal chan struct{}            `json:"shutdown_signal_chan"`
}

type MsgType byte

const (
	SERVER_READ_ERROR MsgType = 0

	START       MsgType = 1
	STOP        MsgType = 2
	METRIC      MsgType = 3
	STATE       MsgType = 4
	CHANGE_NODE MsgType = 5
	CHANGE_POW  MsgType = 6
)

type wsmsg struct {
	MsgType MsgType     `json:"msg_type"`
	Data    interface{} `json:"data"`
	TS      time.Time   `json:"ts"`
}

func newWSMsg() *wsmsg {
	return &wsmsg{TS: time.Now()}
}

type powsmsg struct {
	PoWs []string `json:"pows"`
}

func (router *SpammerRouter) Init() {

	group := router.WebEngine.Group("/api/spammer")

	group.GET("/pows", func(c echo.Context) error {
		return c.JSON(http.StatusOK, powsmsg{router.Ctrl.AvailablePowTypes()})
	})

	group.GET("/shutdown", func(c echo.Context) error {
		fmt.Println("shutting down via router")
		router.ShutdownSignal <- struct{}{}
		return c.JSON(http.StatusOK, SimpleMsg{"ok"})
	})

	group.GET("", func(c echo.Context) error {

		ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
		if err != nil {
			return err
		}
		defer ws.Close()

		writer := make(chan interface{})
		metrics := make(chan interface{})
		stop := make(chan struct{})
		defer close(stop) // auto-free writer, poller

		// subscribe to metrics
		listenerID := router.Ctrl.AddMetricListener(metrics)
		defer router.Ctrl.RemoveMetricListener(listenerID)

		// sync WS writer
		go func() {
			for {
				select {
				case msgToWrite := <-writer:
					if err := ws.WriteJSON(msgToWrite); err != nil {
						return
					}
				case <-stop:
					return
				}
			}
		}()

		// state poller
		go func() {
			for {
				select {
				case <-stop:
					return
				default:
				}
				writer <- wsmsg{MsgType: STATE, Data: router.Ctrl.State(), TS: time.Now()}
				<-time.After(time.Duration(1) * time.Second)
			}
		}()

		// metrics poller
		go func() {
			for {
				select {
				case metric, ok := <-metrics:
					if !ok {
						// timeout was reached in controller for metric send
						return
					}
					writer <- wsmsg{MsgType: METRIC, Data: metric, TS: time.Now()}
				case <-stop:
					return
				}
			}
		}()

		for {
			msg := &wsmsg{}
			if err := ws.ReadJSON(msg); err != nil {
				break
			}

			switch msg.MsgType {
			case START:
				router.Ctrl.Start()
			case STOP:
				router.Ctrl.Stop()
			case CHANGE_NODE:
				router.Ctrl.ChangeNode(msg.Data.(string))
			case CHANGE_POW:
				router.Ctrl.ChangePoWType(msg.Data.(string))
			}

			// auto send state after each received command
			writer <- wsmsg{MsgType: STATE, Data: router.Ctrl.State(), TS: time.Now()}
		}

		return nil
	})
}
