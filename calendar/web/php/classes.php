<?php

class Config {
    function __construct() {
        $home = getenv("HOME");
        if (!$home) {
            $home = $_SERVER['DOCUMENT_ROOT'] . "/..";
        }
        error_log("home =" . $home);
        $opts = json_decode(file_get_contents($home . "/.calendar.json"), true);
        // TODO: unpack the options into the relevant fields here
        $this->root = $opts["root"];
    }

    function get_header(string $name) : string {
        $name = strtolower($name);
        foreach (getallheaders() as $key => $value) {
            if (strtolower($key) == $name) {
                error_log("found header " . $key . " => " . $value);
                return $value;
            }
        }
    }
    
    function read_json_body() {
        return json_decode(file_get_contents("php://input"), true);
    }
}

class ProfileHandler {
    function __construct(private Config $config) {
    }

    function sign_in(array $request) : array {
        $email = $request['email'];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $resp['action'] = 'invalid-email';
            return $resp;
        }
        $password = $request['password'];
        $pfl = $this->read_profile($email);
        $resp = [];
        if ($pfl) {
            // we need to check the password
            error_log("password hashes to:" . password_hash($password, PASSWORD_DEFAULT));
            error_log("have current password: ".$pfl['password']);
            if (password_verify($password, $pfl['password'])) {
                error_log("passed");
                $resp['action'] = 'signed-in';
                $resp['token'] = $this->generate_token_for($pfl['_dir']);
            } else {
                error_log("failed");
                $resp['action'] = 'signin-failed'; // if the password were not to match ...
            }
        } else {
            // this user does not exist ... see if they want to create the user
            $resp['action'] = 'no-user';
        }
        return $resp;
    }

    function sign_out() {
        $resp = [];
        $resp['action'] = 'signed-out';
        return $resp;
    }

    function read_profile($email) : ?array {
        $pfl = urlencode($email);
        $pfldir = $this->config->root . "/" . $pfl;
        if (!is_dir($pfldir)) {
            return null;
        }
        $pflfile = $pfldir . "/.userpfl";
        $ret = json_decode(file_get_contents($pflfile), true);
        $ret['_dir'] = $pfldir;
        return $ret;
    }

    function create_user(array $request) : array {
        $email = $request['email'];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $resp['action'] = 'invalid-email';
            return $resp;
        }
        $password = $request['password'];
        $pfl = urlencode($email);
        $pfldir = $this->config->root . "/" . $pfl;
        $resp = [];
        if (is_dir($pfldir)) {
            $resp['action'] = 'user-exists'; // if the directory already exists, the user already exists
        } else if (strlen($password) < 16) {
            // (new) password is too short
            $resp['action'] = 'invalid-password';
        } else {
            // ok, create the user
            if (!mkdir($pfldir)) {
                $resp['action'] = 'user-exists'; // I'm not sure why this wasn't caught above, but throw an exception anyway
            } else {
                $userp = [];
                $userp['email'] = $email;
                $userp['password'] = password_hash($password, PASSWORD_DEFAULT);
                // error_log("password: $password");
                error_log("have: ".$userp['password']);
                error_log("verify = " . password_verify($password, $userp['password']));
                $userp['email_validated'] = false;
                file_put_contents($pfldir . "/.userpfl", json_encode($userp));
                $resp['action'] = 'user-created';
                $resp['token'] = $this->generate_token_for($pfldir);
            }
        }
        return $resp;
    }

    function current_user() : ?array {
        $token = $this->config->get_header("x-identity-token");
        error_log("token =". $token);
        if (!$token) {
            return null;
        }
        $tokfile = $this->config->root . "/.tokens/$token/token";
        error_log("tokfile =". $tokfile);
        $tokinfo = file_get_contents($tokfile);
        error_log("tokinfo = $tokinfo");
        return json_decode($tokinfo, true);
    }

    function list_calendars() : array {
        $cuser = $this->current_user();
        error_log("list_cals: " . $cuser['dir']);
        $files = array_values(array_filter(scandir($cuser['dir']), "notdot"));
        return $files;
    }

    function send_calendar($called) {
        $cuser = $this->current_user();
        if (str_ends_with($called, ".caljs")) {
            header("Content-Type: application/json");
        }
        readfile($cuser['dir'] . '/' . $called);
    }

    function generate_token_for(string $userdir) : string {
        for (;;) {
            $token = $this->make_token();
            $tdir = $this->config->root . "/.tokens/" . "$token";
            if (mkdir($tdir)) {
                $tokfile = [];
                $tokfile['token'] = $token;
                $tokfile['dir'] = $userdir;
                file_put_contents($tdir . "/token", json_encode($tokfile));
                return $token;
            }
            // else it already exists and we should try a different token
        }
    }

    function make_token() : string {
        $ret = "";
        for ($i=0;$i<60;$i++) {
            if ($i > 0 && $i % 5 == 0)
                $ret .= '-';
            $ch = random_int(48, 109);
            if ($ch > 83)
                $ch += 13;
            else if ($ch > 57)
                $ch += 7;
            $ret .= chr($ch);
        }
        return $ret;
    }
}

function notdot($s) {
    error_log("scanning $s");
    return !str_starts_with($s, ".");
}
?>