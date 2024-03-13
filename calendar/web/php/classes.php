<?php

class Config {
    function __construct() {
        $home = getenv("HOME");
        $opts = json_decode(file_get_contents($home . "/.calendar.json"), true);
        // TODO: unpack the options into the relevant fields here
        $this->root = $opts["root"];
    }

    function read_json_body() {
        return json_decode(file_get_contents("php://input"), true);
    }
}

class ProfileHandler {
    function __construct(private Config $config) {

    }

    function sign_in(array $request) : array {
        $pfl = urlencode($request['email']);
        $pfldir = $this->config->root . "/" . $pfl;
        error_log("profile dir ". $pfldir);
        error_log(is_dir($pfldir));
        $resp = [];
        if (is_dir($pfldir)) {
            // we need to check the password
            $resp['action'] = 'failure'; // if the password were not to match ...
        } else {
            // this user does not exist ... see if they want to create the user
            $resp['action'] = 'nouser';
        }
        return $resp;
    }

    function create_user(array $request) : array {
        $email = $request['email'];
        $password = $request['password'];
        $pfl = urlencode($email);
        $pfldir = $this->config->root . "/" . $pfl;
        error_log("profile dir ". $pfldir);
        error_log(is_dir($pfldir));
        $resp = [];
        if (is_dir($pfldir)) {
            $resp['action'] = 'user_exists'; // if the directory already exists, the user already exists
        } else if (strlen($password) < 16) {
            // (new) password is too short
            $resp['action'] = 'invalid_password';
        } else {
            // ok, create the user
            mkdir($pfldir);
            $userp = [];
            $userp['email'] = $email;
            $userp['password'] = password_hash($password);
            $userp['email_validated'] = false;
            file_put_contents($pfldir . "/.userpfl", json_encode($userp));
            $resp['action'] = 'user_created';
        }
        return $resp;
    }
}
?>