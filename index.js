const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// ===== Ready =====
client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

// ===== Interacciones (Slash Commands) =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "ban") {
    const usuario = options.getUser("usuario");
    const motivo = options.getString("motivo");
    const apelable = options.getBoolean("apelable");

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🚫 Usuario baneado")
      .setDescription(`**Usuario:** ${usuario}\n**Motivo:** ${motivo}\n**Apelable:** ${apelable ? "Sí" : "No"}`)
      .setThumbnail("attachment://logo.png")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: ["main/logo.png"] });
  }

  else if (commandName === "kick") {
    const usuario = options.getUser("usuario");
    const motivo = options.getString("motivo");

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("👢 Usuario expulsado")
      .setDescription(`**Usuario:** ${usuario}\n**Motivo:** ${motivo}`)
      .setThumbnail("attachment://logo.png")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: ["main/logo.png"] });
  }

  else if (commandName === "warn") {
    const usuario = options.getUser("usuario");
    const motivo = options.getString("motivo");

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("⚠️ Advertencia")
      .setDescription(`**Usuario:** ${usuario}\n**Motivo:** ${motivo}`)
      .setThumbnail("attachment://logo.png")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: ["main/logo.png"] });
  }

  else if (commandName === "msg") {
    const usuario = options.getUser("usuario");

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📩 Solicitud de ticket")
      .setDescription(`El staff te contactará pronto, ${usuario}.`)
      .setThumbnail("attachment://logo.png")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: ["main/logo.png"] });
  }
});

// ===== Login =====
client.login(TOKEN);
