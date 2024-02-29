# ==============================================================================
# FEOP
# ==============================================================================

alias format="npx prettier@latest --write ."

backend() {
  set -x
  export SPRING_PROFILES_ACTIVE=local,local-override,skip-auth
  ./gradlew :application:assemble :application:bootRun
  set +x
}

gateway() {
  set -x
  ./gateway/start.sh
  set +x
}

publish() {
  set -x
  ./scripts/publish-subgraphs.sh -g feop-local-d9btg@current -r http://localhost:8080/graphql
  set +x
}

postgres() {
  name=feop-postgres
  port=5432
  user=postgres
  password=password
  db=feop

  set -x

  # Remove a potentially existing container and volume.
  docker rm -f $name
  docker volume rm -f $name

  # Note that we
  # - create a volume for the database so we can clear it easily
  # - set the shared_buffers to 256MB and max_connections to 200
  # - start it in the background so you don't have to keep the terminal open
  docker run \
    --volume $name:/var/lib/postgresql/data \
    --env POSTGRES_USER=$user \
    --env POSTGRES_PASSWORD=$password \
    --env POSTGRES_DB=$db \
    --publish $port:$port \
    --detach \
    --name $name \
    postgres \
    -c shared_buffers=256MB \
    -c max_connections=200

  set +x
}
