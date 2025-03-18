package chrome

import (
	"context"
	"log"
	"time"

	"github.com/gmmapowell/ignorance/cdp-till/internal/watcher"
	"github.com/mafredri/cdp"
	"github.com/mafredri/cdp/devtool"
	"github.com/mafredri/cdp/protocol/page"
	"github.com/mafredri/cdp/protocol/target"
	"github.com/mafredri/cdp/rpcc"
)

type Reloader struct {
	devconn *devtool.DevTools
	page    *devtool.Target
	client  *cdp.Client
	loadURL string
}

func (r *Reloader) Changed(file string) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if r.page == nil {
		if !r.EnsurePage(ctx) {
			return
		}
	}

	reloaded := r.TryReloading(ctx)

	if !reloaded {
		r.NavigateToURL(ctx)
	}
}

func (r *Reloader) EnsurePage(ctx context.Context) bool {
	var err error
	r.page, err = r.devconn.Get(ctx, devtool.Page)
	if err != nil {
		r.page, err = r.devconn.Create(ctx)
		if err != nil {
			log.Printf("Error opening a window: %v\n", err)
			return false
		}
	}

	conn, err := rpcc.DialContext(ctx, r.page.WebSocketDebuggerURL)
	if err != nil {
		log.Printf("Error connecting to CDP: %v\n", err)
		return false
	}

	r.client = cdp.NewClient(conn)
	return true
}

func (r *Reloader) TryReloading(ctx context.Context) bool {
	tabs, err := r.client.Target.GetTargets(ctx, &target.GetTargetsArgs{})
	if err != nil {
		log.Printf("Error recovering targets: %v\n", err)
		r.client.Page.Close(ctx)
		r.EnsurePage(ctx)
		return false
	}
	for _, ti := range tabs.TargetInfos {
		if ti.URL == r.loadURL {
			reload := &page.ReloadArgs{}
			reload.SetIgnoreCache(true)
			err = r.client.Page.Reload(ctx, reload)
			if err != nil {
				log.Printf("Error refreshing target: %v\n", err)
				return false
			}
			return true
		}
	}
	return false
}

func (r *Reloader) NavigateToURL(ctx context.Context) {
	navArgs := page.NewNavigateArgs(r.loadURL)
	nav, err := r.client.Page.Navigate(ctx, navArgs)
	if err != nil {
		log.Printf("Error navigating: %v\n", err)
		return
	}
	if nav.ErrorText != nil {
		log.Printf("Error navigating: %v\n", *nav.ErrorText)
		return
	}
}

func NewReloader(url, devurl string) watcher.FileChanged {
	ret := &Reloader{loadURL: url, devconn: devtool.New(devurl)}

	// Make sure it loads 50ms after we start up, thus allowing the server to start
	time.AfterFunc(50*time.Millisecond, func() {
		ret.Changed("")
	})

	return ret
}
