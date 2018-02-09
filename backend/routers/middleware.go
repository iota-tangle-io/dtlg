package routers

import "github.com/labstack/echo"

func noCacheHeaders(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		header := c.Response().Header()
		header.Set("Cache-Control", "no-cache")
		header.Set("Expires", "-1")
		return next(c)
	}
}
