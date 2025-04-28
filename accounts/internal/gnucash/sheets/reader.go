package sheets

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"github.com/pkg/browser"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	sheets "google.golang.org/api/sheets/v4"
)

func ReadSpreadsheet(conf *config.Configuration, rcvr Receiver) {
	ctx := context.Background()

	client, err := getClient(conf)
	if err != nil {
		panic(err)
	}

	sheetsService, err := sheets.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		panic(err)
	}

	info, err := sheetsService.Spreadsheets.Get(conf.Spreadsheet).Do()
	if err != nil {
		panic(err)
	}

	var tabs []Tab
	for _, sheet := range info.Sheets {
		tab := gatherTabData(sheetsService, conf.Spreadsheet, sheet.Properties.Title, sheet.Properties.GridProperties.RowCount, sheet.Properties.GridProperties.ColumnCount)
		tabs = append(tabs, tab)
	}

	rcvr.DeliverSheet(tabs)
}

func gatherTabData(svc *sheets.Service, sheetId, title string, rc, cc int64) Tab {
	cells, err := svc.Spreadsheets.Values.Get(sheetId, fmt.Sprintf("%s!R1C1:R%dC%d", title, rc, cc)).Do()
	if err != nil {
		panic(err)
	}

	heads := make(map[int]string)
	tab := Tab{Title: title}
	for i, r := range cells.Values {
		if i == 0 {
			for j, c := range r {
				heads[j] = c.(string)
			}
		} else {
			row := Row{Columns: make(map[string]any)}
			for j, c := range r {
				if heads[j] != "" {
					row.Columns[heads[j]] = c
				}
			}
			tab.Rows = append(tab.Rows, row)
		}
	}
	return tab
}

func getClient(conf *config.Configuration) (*http.Client, error) {
	jc, err := readCredentials(conf)
	if err != nil {
		return nil, err
	}

	tok, err := getToken(conf, jc)
	if err != nil {
		return nil, err
	}

	return jc.Client(context.Background(), tok), nil
}

func readCredentials(conf *config.Configuration) (*oauth2.Config, error) {
	b, err := os.ReadFile(conf.OAuth)
	if err != nil {
		return nil, fmt.Errorf("unable to read client secret file: %v", err)
	}

	c, err := google.ConfigFromJSON(b, "https://www.googleapis.com/auth/spreadsheets.readonly")
	if err != nil {
		return nil, fmt.Errorf("unable to parse client secret file to config: %v", err)
	}

	c.RedirectURL = conf.RedirectURI()
	return c, nil
}

func getToken(conf *config.Configuration, jc *oauth2.Config) (*oauth2.Token, error) {
	tok, err := tokenFromFile(conf.Token)
	if err == nil {
		return tok, nil
	}

	tok, err = tokenFromWeb(conf, jc)
	if err != nil {
		return nil, err
	}

	err = saveToken(conf, tok)
	if err != nil {
		return nil, err
	}
	return tok, nil
}

func tokenFromFile(file string) (*oauth2.Token, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

func tokenFromWeb(conf *config.Configuration, jc *oauth2.Config) (*oauth2.Token, error) {
	ch := make(chan string)
	ws := launchWebServer(conf, ch)
	authURL := jc.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	browser.OpenURL(authURL)

	defer ws.Shutdown(context.Background())

	authCode := <-ch

	tok, err := jc.Exchange(context.TODO(), authCode)
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve token from web: %v", err)
	}
	return tok, nil
}

func saveToken(conf *config.Configuration, tok *oauth2.Token) error {
	fmt.Printf("Saving credential file to: %s\n", conf.Token)
	f, err := os.OpenFile(conf.Token, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return fmt.Errorf("unable to cache oauth token: %v", err)
	}
	defer f.Close()
	json.NewEncoder(f).Encode(tok)

	return nil
}

func launchWebServer(conf *config.Configuration, ch chan string) *http.Server {
	handlers := http.NewServeMux()
	redirectUri := &RedirectHandler{channel: ch}
	handlers.Handle("/redirect_uri", redirectUri)

	addr := conf.ListenOn()
	server := &http.Server{Addr: addr, Handler: handlers}
	go func() {
		err := server.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			fmt.Printf("error starting server: %s\n", err)
		}
	}()
	return server
}

type RedirectHandler struct {
	channel chan string
}

func (r *RedirectHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {
	code := req.URL.Query()["code"]
	r.channel <- code[0]
}
