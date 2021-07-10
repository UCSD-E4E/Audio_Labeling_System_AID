#!/usr/bin/env bash

set -o errexit

app="/app/backend"
venv="${app}/venv"

if [[ ! -f "${venv}/bin/python" ]]; then
  echo "Creating virtual environement"
  mkdir -p "${venv}"
  python3 -m venv "${venv}"
  pip3 install --upgrade setuptools
fi

echo "Activating environment"
if [[ -f "${venv}/Scripts/activate" ]]; then
  source "${venv}/Scripts/activate"
else
  source "${venv}/bin/activate"
fi

echo "Installing dependencies"
pip3 install -r "${app}/requirements.txt"

echo "Connecting to database"
python3 "${app}/scripts/wait_for_database.py"

echo "Applying new migrations"
cd "${app}" && flask db stamp "f708012506ac"|| true
echo "Creating Migration"
cd "${app}" && flask db migrate -m "I deleted all the tables" || true
echo "Upgrading"
cd "${app}" && flask db upgrade || true
#cd "${app}" && flask db history || true

if [[ -n "${ADMIN_PASSWORD}" ]] && [[ -n "${ADMIN_USERNAME}" ]]; then
  python3 "${app}/scripts/create_admin_user.py" \
    --username "${ADMIN_USERNAME}" \
    --password "${ADMIN_PASSWORD}"
fi

echo "Starting flask development server"
pylint "${app}" || cd "${app}" && flask run --host=0.0.0.0 --port=5000
cd "${app}" && flask run --host=0.0.0.0 --port=5000
# sleep infinity
