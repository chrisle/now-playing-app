#!/bin/bash
echo "PRAGMA key='$1';select count(*) from sqlite_master;ATTACH DATABASE '../_test_/decrypt.db' AS plaintext KEY '';SELECT sqlcipher_export('plaintext');DETACH DATABASE plaintext;" | npx sqlcipher ../_test_/master.db
echo "Done."