#!/bin/bash

alias sso-login="docker compose exec -it backend bash -c 'aws sso login --use-device-code'"
