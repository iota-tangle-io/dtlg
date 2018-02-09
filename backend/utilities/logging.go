package utilities

import (
	"os"
	"gopkg.in/inconshreveable/log15.v2"
	"fmt"
	"github.com/mattn/go-colorable"
)

var Debug = false

func init() {
	os.Mkdir("./logs", 0777)
}

func GetLogger(name string) (log15.Logger, error) {

	// open a new logfile
	fileHandler, err := log15.FileHandler(fmt.Sprintf("./logs/%s.log", name), log15.LogfmtFormat())
	if err != nil {
		return nil, err
	}

	handler := log15.MultiHandler(
		fileHandler,
		log15.StreamHandler(colorable.NewColorableStdout(), log15.TerminalFormat()),
	)
	if !Debug {
		handler = log15.LvlFilterHandler(log15.LvlInfo, handler)
	}
	logger := log15.New("comp", name)
	logger.SetHandler(handler)
	return logger, nil
}
