package sheets

import (
	"context"
	"fmt"

	"github.com/gmmapowell/ignorance/accounts/internal/gnucash/config"
	"google.golang.org/api/option"
	sheets "google.golang.org/api/sheets/v4"
)

func ReadSpreadsheet(conf *config.Configuration, rcvr Receiver) {
	ctx := context.Background()
	sheetsService, err := sheets.NewService(ctx, option.WithAPIKey(conf.APIKey))
	if err != nil {
		panic(err)
	}
	call := sheetsService.Spreadsheets.Get(conf.Spreadsheet)
	fmt.Printf("%v\n", call)
}
