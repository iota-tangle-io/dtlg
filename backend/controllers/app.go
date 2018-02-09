package controllers

import "github.com/pkg/errors"

var ErrInvalidObjectId = errors.New("invalid object id")

type AppCtrl struct {
}

func (ac *AppCtrl) Init() error {
	return nil
}
