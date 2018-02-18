/*
MIT License

Copyright (c) 2018 iota-tangle.io

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
package spamalot

import (
	"log"
	"math"
	"time"

	"github.com/cwarner818/giota"
)

type MetricType byte

const (
	INC_MILESTONE_BRANCH MetricType = iota
	INC_MILESTONE_TRUNK
	INC_BAD_TRUNK
	INC_BAD_BRANCH
	INC_BAD_TRUNK_AND_BRANCH
	INC_FAILED_TX
	INC_SUCCESSFUL_TX
	INC_NEW_CACHED_TX
	INC_GET_CACHED_TX
	SET_CONFIRMATION_RATE
	SUMMARY
)

type Metric struct {
	Kind MetricType  `json:"kind" bson:"kind"`
	Data interface{} `json:"data" bson:"data"`
}

type Summary struct {
	TXsSucceeded      int     `json:"txs_succeeded"`
	TXsFailed         int     `json:"txs_failed"`
	BadBranch         int     `json:"bad_branch"`
	BadTrunk          int     `json:"bad_trunk"`
	BadTrunkAndBranch int     `json:"bad_trunk_and_branch"`
	MilestoneTrunk    int     `json:"milestone_trunk"`
	MilestoneBranch   int     `json:"milestone_branch"`
	TPS               float64 `json:"tps"`
	ErrorRate         float64 `json:"error_rate"`
	CachedTX          int     `json:"cached_tx"`
	RetrievedTX       int     `json:"new_tx"`
	ConfirmationRate  float64 `json:"confirmation_rate"`
}

type TXData struct {
	Hash  giota.Trytes `json:"hash"`
	Count int          `json:"count"`
	Node  string       `json:"node"`
}

type txandnode struct {
	tx   Transaction
	node Node
}

func newMetricsRouter(db *Database) *metricsrouter {
	return &metricsrouter{
		metrics:    make(chan Metric),
		stopSignal: make(chan struct{}),
		db:         db,
	}
}

type metricsrouter struct {
	metrics    chan Metric
	stopSignal chan struct{}
	relay      chan<- Metric

	startTime time.Time

	txsSucceeded, txsFailed, badBranch, badTrunk, badTrunkAndBranch int
	milestoneTrunk, milestoneBranch, txCached, txRetrieved          int
	confirmationRate                                                float64

	db *Database
}

func (mr *metricsrouter) stop() {
	mr.metrics = nil
	mr.stopSignal <- struct{}{}
}

func (mr *metricsrouter) addMetric(kind MetricType, data interface{}) {
	mr.metrics <- Metric{kind, data}
}

func (mr *metricsrouter) addRelay(relay chan<- Metric) {
	mr.relay = relay
}

func (mr *metricsrouter) collect() {
	mr.startTime = time.Now()
	mr.db.dbNewRun(mr.startTime.Format(rfc3339nano))
	for {
		select {
		case <-mr.stopSignal:
			return
		case metric := <-mr.metrics:
			switch metric.Kind {
			case INC_MILESTONE_BRANCH:
				mr.milestoneBranch++
			case INC_MILESTONE_TRUNK:
				mr.milestoneTrunk++
			case INC_BAD_TRUNK:
				mr.badTrunk++
			case INC_BAD_BRANCH:
				mr.badBranch++
			case INC_BAD_TRUNK_AND_BRANCH:
				mr.badTrunkAndBranch++
			case INC_FAILED_TX:
				mr.txsFailed++
			case INC_NEW_CACHED_TX:
				mr.txCached++
			case INC_GET_CACHED_TX:
				mr.txRetrieved++
			case SET_CONFIRMATION_RATE:
				mr.confirmationRate = metric.Data.(float64)
			case INC_SUCCESSFUL_TX:
				mr.txsSucceeded++
				mr.printMetrics(metric.Data.(txandnode))
			}

			if mr.relay != nil && metric.Kind != INC_SUCCESSFUL_TX {
				mr.relay <- metric
			}
		}
	}
}
func (mr *metricsrouter) getSummary() *Summary {
	dur := time.Since(mr.startTime)
	tps := float64(mr.txsSucceeded) / dur.Seconds()
	successRate := 100 * (float64(mr.txsSucceeded) / (float64(mr.txsSucceeded) + float64(mr.txsFailed)))

	errorRate := 100 - successRate
	if math.IsNaN(errorRate) {
		errorRate = 0
	}
	return &Summary{
		TXsSucceeded:      mr.txsSucceeded,
		TXsFailed:         mr.txsFailed,
		BadBranch:         mr.badBranch,
		BadTrunk:          mr.badBranch,
		BadTrunkAndBranch: mr.badTrunkAndBranch,
		MilestoneTrunk:    mr.milestoneTrunk,
		MilestoneBranch:   mr.milestoneBranch,
		TPS:               tps,
		ErrorRate:         errorRate,
		CachedTX:          mr.txCached,
		RetrievedTX:       mr.txRetrieved,
		ConfirmationRate:  mr.confirmationRate,
	}
}
func (mr *metricsrouter) printMetrics(txAndNode txandnode) {
	tx := txAndNode.tx
	// Save transaction to database
	mr.db.LogSentTransactions(tx.Transactions)

	node := txAndNode.node
	var hash giota.Trytes
	if len(tx.Transactions) > 1 {
		hash = giota.Bundle(tx.Transactions).Hash()
		log.Println("Bundle sent to", node,
			"\nhttp://thetangle.org/bundle/"+hash)
	} else {
		hash = tx.Transactions[0].Hash()
		log.Println("Txn sent to", node,
			"\nhttp://thetangle.org/transaction/"+hash)
	}

	// TPS = delta since startup / successful TXs
	dur := time.Since(mr.startTime)
	tps := float64(mr.txsSucceeded) / dur.Seconds()

	// success rate = successful TXs / successful TXs + failed TXs
	successRate := 100 * (float64(mr.txsSucceeded) / (float64(mr.txsSucceeded) + float64(mr.txsFailed)))
	log.Printf("%.2f TPS -- success rate %.0f%% Confirmed: %0.2f%%\n", tps, successRate, mr.confirmationRate)

	log.Printf("Duration: %s Count: %d Milestone Trunk: %d Milestone Branch: %d Bad Trunk: %d Bad Branch: %d Both: %d Fetched: %d Cached: %d",
		dur.String(), mr.txsSucceeded, mr.milestoneTrunk,
		mr.milestoneBranch, mr.badTrunk, mr.badBranch, mr.badTrunkAndBranch, mr.txCached, mr.txRetrieved)

	// send current state of the spammer
	if mr.relay != nil {
		summary := mr.getSummary()
		mr.relay <- Metric{Kind: SUMMARY, Data: summary}

		// send tx
		txData := TXData{Hash: hash, Count: len(tx.Transactions), Node: node.URL}
		mr.relay <- Metric{Kind: INC_SUCCESSFUL_TX, Data: txData}
	}

}
