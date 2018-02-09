package controllers

import (
	"github.com/iota-tangle-io/iota-spamalot.go"
	"github.com/CWarner818/giota"
	"sync"
	"time"
)

const NirvanaAddress = "999999999999999999999999999999999999999999999999999999999999999999999999999999999"
const DefaultMessage = "GOSPAMMER9SPAMALOT"
const DefaultTag = "999SPAMALOT"

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
	spammer, _ := spamalot.New(
		spamalot.WithMWM(int64(14)),
		spamalot.WithDepth(giota.Depth),
		spamalot.ToAddress(NirvanaAddress),
		spamalot.WithTag(DefaultTag),
		spamalot.WithMessage(DefaultMessage),
		spamalot.WithSecurityLevel(spamalot.SecurityLevel(2)),
		spamalot.FilterTrunk(false),
		spamalot.FilterBranch(false),
		spamalot.FilterMilestone(false),
		spamalot.WithMetricsRelay(ctrl.metrics),
		spamalot.WithStrategy(""),
	)

	// configure PoW
	_, pow := giota.GetBestPoW()
	spammer.UpdateSettings(spamalot.WithPoW(pow))
	spammer.UpdateSettings(spamalot.WithNode(ctrl.nodeURL, true))
	return spammer
}

func (ctrl *SpammerCtrl) Init() error {
	ctrl.nodeURL = "http://nodes.iota.fm:80"
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
		<-time.After(time.Duration(1)*time.Second)
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
