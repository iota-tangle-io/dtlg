package controllers

import (
	"fmt"
	"math/rand"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/CWarner818/giota"
	"github.com/iota-tangle-io/iota-spamalot.go"
)

const DefaultMessage = "DISTRIBUTED9TANGLE9LOAD9GENERATOR"
const DefaultTag = "999DTLG"

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9"

type StatusMsg struct {
	Running bool   `json:"running"`
	Node    string `json:"node"`
}

type SpammerCtrl struct {
	spammer *spamalot.Spammer
	metrics chan spamalot.Metric

	// synchronise access to spammer for now
	mu sync.Mutex

	muListeners    sync.Mutex
	listeners      map[int]chan interface{}
	nextListenerID int

	nodeURL string
}

func (ctrl *SpammerCtrl) createSpammer() *spamalot.Spammer {
	var address string
	for i := 0; i < 81; i++ {
		address += string(alphabet[rand.Intn(len(alphabet))])
	}

	// configure PoW
	s, pow := giota.GetBestPoW()
	fmt.Println("using PoW:", s)

	os := strings.ToUpper(runtime.GOOS)
	tag := DefaultTag + "9" + os + "9" + strings.ToUpper(s)

	spammer, _ := spamalot.New(
		spamalot.WithMWM(int64(14)),
		spamalot.WithDepth(giota.Depth),
		spamalot.ToAddress(address),
		spamalot.WithTag(tag),
		spamalot.WithMessage(DefaultMessage),
		spamalot.WithSecurityLevel(spamalot.SecurityLevel(2)),
		spamalot.WithMetricsRelay(ctrl.metrics),
		spamalot.WithStrategy(""),
		spamalot.WithPoW(pow),
		spamalot.WithNode(ctrl.nodeURL, false),
	)

	return spammer
}

func (ctrl *SpammerCtrl) Init() error {
	ctrl.nodeURL = ""
	ctrl.metrics = make(chan spamalot.Metric)
	ctrl.listeners = map[int]chan interface{}{}

	ctrl.spammer = ctrl.createSpammer()
	go ctrl.readMetrics()

	return nil
}

func (ctrl *SpammerCtrl) readMetrics() {
	for metric := range ctrl.metrics {
		ctrl.muListeners.Lock()
		for id, channel := range ctrl.listeners {
			select {
			case channel <- metric:
				// timeout
			case <-time.After(time.Duration(1) * time.Second):
				// auto remove if not writable within 1 second
				delete(ctrl.listeners, id)
				close(channel) // unwind listener
			}
		}
		ctrl.muListeners.Unlock()
	}
}

func (ctrl *SpammerCtrl) Start() error {
	ctrl.mu.Lock()
	defer ctrl.mu.Unlock()
	if ctrl.spammer.IsRunning() {
		return nil
	}
	go ctrl.spammer.Start()
	<-time.After(time.Duration(1) * time.Second)
	return nil
}

func (ctrl *SpammerCtrl) Stop() error {
	ctrl.mu.Lock()
	defer ctrl.mu.Unlock()
	if !ctrl.spammer.IsRunning() {
		return nil
	}
	ctrl.spammer.Stop()
	return nil
}

func (ctrl *SpammerCtrl) State() *StatusMsg {
	msg := &StatusMsg{}
	msg.Running = ctrl.spammer.IsRunning()
	msg.Node = ctrl.nodeURL
	return msg
}

func (ctrl *SpammerCtrl) ChangeNode(node string) {
	wasRunning := ctrl.spammer.IsRunning()
	ctrl.Stop()
	ctrl.nodeURL = node
	ctrl.spammer = ctrl.createSpammer()
	if wasRunning {
		go ctrl.spammer.Start()
		<-time.After(time.Duration(1) * time.Second)
	}
}

func (ctrl *SpammerCtrl) AddMetricListener(channel chan interface{}) int {
	ctrl.muListeners.Lock()
	defer ctrl.muListeners.Unlock()
	ctrl.nextListenerID++
	ctrl.listeners[ctrl.nextListenerID] = channel
	return ctrl.nextListenerID
}

func (ctrl *SpammerCtrl) RemoveMetricListener(id int) {
	ctrl.muListeners.Lock()
	defer ctrl.muListeners.Unlock()
	if _, ok := ctrl.listeners[id]; ok {
		delete(ctrl.listeners, id)
	}
}
