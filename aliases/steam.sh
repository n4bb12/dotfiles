# https://www.rustafied.com/how-to-host-your-own-rust-server
# https://rustmaps.com/
rust-server() {
  echo "client.connect localhost:28015"
  seed=1179508741
  size=3500

  cd /d/Spiele/SteamCmd

  steamcmd +login anonymous +app_update 258550 +quit

  cd /d/Spiele/SteamCmd/steamapps/common/rust_dedicated

  # +rcon.password k4gl9 \
  # +server.hostname "hostname" \
  # +server.description "description" \
  # +server.headerimage "https://i.imgur.com/qIZ0NKg.jpg" \
  # +server.url "https://n4bb12.dev" \
  RustDedicated -batchmode \
    +rcon.port 28016 \
    +rcon.web 1 \
    +server.port 28015 \
    +server.maxplayers 1 \
    +server.level "Procedural Map" \
    +server.seed ${seed} \
    +server.worldsize ${size} \
    +server.identity "procedural_${seed}_${size}"
}
