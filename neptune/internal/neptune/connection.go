package neptune

import "strings"

type Connection struct {
	User         string
	ConnectionId string
}

func OrderConnection(left, right *Connection) int {
	ret := strings.Compare(left.User, right.User)
	if ret != 0 {
		return ret
	}
	return strings.Compare(left.ConnectionId, right.ConnectionId)
}
