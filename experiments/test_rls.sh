#!/bin/sh
set -eu
export PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=postgres
psql -v ON_ERROR_STOP=1 -f experiments/rls_ci_setup.sql
check() {
  who="$1"; expected="$2"
  got=$(psql -At -v ON_ERROR_STOP=1 -c "begin; set local role authenticated; select set_config('request.jwt.claim.sub','$who',true); select count(*) from ck_test.units; commit;" | sed -n '2p')
  if [ "$got" != "$expected" ]; then
    echo "RLS failed for $who: expected $expected, got $got" >&2
    exit 1
  fi
}
check 00000000-0000-0000-0000-000000000001 1
check 00000000-0000-0000-0000-000000000002 0
check 00000000-0000-0000-0000-000000000003 2
check 00000000-0000-0000-0000-000000000099 0
echo "RLS smoke checks passed"
