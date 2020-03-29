package main

import (
	"net/http"
)

func main() {
	http.HandleFunc("/", redirectHandler)
}

func redirectHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/", 302)
}
