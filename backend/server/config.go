package server

import (
	"encoding/json"
	"io/ioutil"
	"reflect"
	"strings"
	"os"
	"path/filepath"
)

type Config interface{}

var subconfigs = []Config{&AppConfig{}, &NetConfig{}}

func LoadConfig() *Configuration {
	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exPath := filepath.Dir(ex)
	configuration := &Configuration{}
	refConfig := reflect.Indirect(reflect.ValueOf(configuration))

	// go through each sub config, load it and init it on the main struct
	for _, c := range subconfigs {
		// indirect as 'c' is pointer to struct
		ind := reflect.Indirect(reflect.ValueOf(c))
		ty := ind.Type()
		field, _ := ty.FieldByName("Location")
		fileLocation := field.Tag.Get("loc")

		// read file indicated by the field tag
		fileBytes, err := ioutil.ReadFile(exPath + fileLocation)
		if err != nil {
			panic(err)
		}
		if err := json.Unmarshal(fileBytes, c); err != nil {
			panic(err)
		}

		// init configuration struct field with the given config
		configFieldName := strings.Split(ty.Name(), "Config")[0]
		refConfig.FieldByName(configFieldName).Set(ind)
	}
	return configuration
}

type Configuration struct {
	App AppConfig
	Net NetConfig
}

type AppConfig struct {
	Location        interface{} `loc:"/configs/app.json"`
	Name            string
	Dev             bool
	AutoOpenBrowser bool
	Verbose         bool
}

type NetConfig struct {
	Location    interface{} `loc:"/configs/network.json"`
	HTTP        WebConfig
	Coordinator CoordinatorConfig
}

type WebConfig struct {
	Domain  string
	Address string
	Assets struct {
		Static  string
		HTML    string
		Favicon string
	}
	LogRequests bool
}

type CoordinatorConfig struct {
	Address  string
	APIToken string
}
