package main

import (
	"log"
	"net/http"
	"path/filepath"
)

func main() {
	path, _ := filepath.Abs("view")
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir(path))))
	log.Println("Server running on port 8070")
	http.ListenAndServe(":8070", nil)
}
