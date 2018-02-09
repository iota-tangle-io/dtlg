package routers

import (
	"fmt"
	"github.com/labstack/echo"
	"github.com/pkg/errors"
	"gopkg.in/mgo.v2"
	"net/http"
	"github.com/iota-tangle-io/dtlg/backend/controllers"
)

var ErrBadRequest = errors.New("bad request")
var ErrUnauthorized = errors.New("unauthorized")
var ErrInternalServer = errors.New("internal server error")
var ErrForbidden = errors.New("access forbidden")

type SimpleMsg struct {
	Msg string `json:"msg"`
}

type SimpleCountMsg struct {
	Count int `json:"count"`
}

type Router interface {
	Init()
}

type IndexRouter struct {
	WebEngine          *echo.Echo `inject:""`
	Dev                bool       `inject:"dev"`
}

func (indexRouter *IndexRouter) Init() {

	indexRouter.WebEngine.GET("/", indexRouter.indexRoute)
	indexRouter.WebEngine.GET("*", indexRouter.indexRoute)

	indexRouter.WebEngine.HTTPErrorHandler = func(err error, c echo.Context) {
		c.Logger().Error(err)

		var statusCode int
		var message string

		switch errors.Cause(err) {

		// executed when the route was not found
		// also used to auto. reroute to the SPA page
		case echo.ErrNotFound:
			c.Redirect(http.StatusSeeOther, "/")
			return

			// 401 unauthorized
		case echo.ErrUnauthorized:
			statusCode = http.StatusUnauthorized
			message = "unauthorized"

			// 403 forbidden
		case ErrForbidden:
			statusCode = http.StatusForbidden
			message = "access forbidden"

			// 500 internal server error
		case ErrInternalServer:
			statusCode = http.StatusInternalServerError
			message = "internal server error"

			// 404 not found
		case mgo.ErrNotFound:
			statusCode = http.StatusNotFound
			message = "not found"

			// 400 bad request
		case controllers.ErrInvalidObjectId:
			fallthrough
		case ErrBadRequest:
			message = "bad request"

			// 500 internal server error
		default:
			statusCode = http.StatusInternalServerError
			message = "internal server error"
		}

		message = fmt.Sprintf("%s, error: %+v", message, err)
		c.String(statusCode, message)
	}
}

func (indexRouter *IndexRouter) indexRoute(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", map[string]interface{}{"dev": indexRouter.Dev})
}
