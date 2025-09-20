const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require("discord.js");
require("dotenv").config();

// Crear cliente
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// IDs fijos
const CANAL_SANCIONES = "1397738825609904242"; 
const CANAL_TICKETS = "1390152260578967559"; 

// ===== Slash Commands =====
const commands = [
  // /ban
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a banear").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del ban").setRequired(true))
    .addBooleanOption(opt => opt.setName("apelable").setDescription("¿Es apelable?").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  // /kick
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a expulsar").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del kick").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  // /warn
  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advierte a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a advertir").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del warn").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // /msg
  new SlashCommandBuilder()
    .setName("msg")
    .setDescription("Envía solicitud de ticket a un usuario. (Solo moderadores)")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario destinatario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
].map(cmd => cmd.toJSON());

// ===== Registrar comandos =====
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log("⏳ Registrando comandos...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("✅ Comandos listos.");
  } catch (err) {
    console.error(err);
  }
})();

// ===== Eventos =====
client.once("ready", () => {
  console.log(`🚍 Bot conectado como ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "Discord de General Tomás Guido 🚌", type: 0 }],
    status: "online"
  });
});

// Mención al bot
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.mentions.has(client.user)) {
    const respuestas = [
      "👋 ¡Hola, soy el bot de General Tomás Guido!",
      "🚌 ¡Subite que arrancamos!",
      "⚙️ ¿Necesitás ayuda? Estoy listo.",
      "🚍 ¿Ya sacaste tu ticket para un viaje?)",
      "📩 Mira nuestra [Web Oficial](abelcraftok.github.io/GTG/)"
    ];
    const random = respuestas[Math.floor(Math.random() * respuestas.length)];
    await message.reply(random);
  }
});

// Slash commands handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, user, guild } = interaction;
  const canalSanciones = guild.channels.cache.get(CANAL_SANCIONES);

  if (commandName === "ban") {
    const target = options.getUser("usuario");
    const motivo = options.getString("motivo");
    const apelable = options.getBoolean("apelable");

    const embed = new EmbedBuilder()
      .setTitle("🚨 Usuario Baneado")
      .setColor("Red")
      .addFields(
        { name: "Usuario", value: `${target.tag} (${target.id})` },
        { name: "Moderador", value: `${user.tag}` },
        { name: "Motivo", value: motivo },
        { name: "Apelable", value: apelable ? "✅ Sí" : "❌ No" }
      )
      .setTimestamp();

    try {
      const member = await guild.members.fetch(target.id);
      await member.ban({ reason: motivo });
      await target.send({ embeds: [embed] }).catch(() => {});
      await canalSanciones.send({ embeds: [embed] });
      await interaction.reply({ content: `🚍 ${target.tag} fue baneado.`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: "❌ No pude banear al usuario.", ephemeral: true });
    }
  }

  if (commandName === "kick") {
    const target = options.getUser("usuario");
    const motivo = options.getString("motivo");

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Usuario Expulsado")
      .setColor("Orange")
      .addFields(
        { name: "Usuario", value: `${target.tag} (${target.id})` },
        { name: "Moderador", value: `${user.tag}` },
        { name: "Motivo", value: motivo }
      )
      .setTimestamp();

    try {
      const member = await guild.members.fetch(target.id);
      await member.kick(motivo);
      await target.send({ embeds: [embed] }).catch(() => {});
      await canalSanciones.send({ embeds: [embed] });
      await interaction.reply({ content: `🚍 ${target.tag} fue expulsado.`, ephemeral: true });
    } catch {
      await interaction.reply({ content: "❌ No pude expulsar al usuario.", ephemeral: true });
    }
  }

  if (commandName === "warn") {
    const target = options.getUser("usuario");
    const motivo = options.getString("motivo");

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Advertencia")
      .setColor("Yellow")
      .addFields(
        { name: "Usuario", value: `${target.tag} (${target.id})` },
        { name: "Moderador", value: `${user.tag}` },
        { name: "Motivo", value: motivo }
      )
      .setTimestamp();

    try {
      await target.send({ embeds: [embed] }).catch(() => {});
      await canalSanciones.send({ embeds: [embed] });
      await interaction.reply({ content: `🚍 ${target.tag} recibió una advertencia.`, ephemeral: true });
    } catch {
      await interaction.reply({ content: "❌ No pude advertir al usuario.", ephemeral: true });
    }
  }

  if (commandName === "msg") {
    const target = options.getUser("usuario");

    const embed = new EmbedBuilder()
      .setTitle("📩 Solicitud de Ticket")
      .setDescription(`Un moderador de **General Tomás Guido** solicita que abras un ticket en <#${CANAL_TICKETS}>`)
      .setColor("Blue")
      .setFooter({ text: "Sistema de tickets • General Tomás Guido" })
      .setTimestamp();

    try {
      await target.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Solicitud enviada a ${target.tag}.`, ephemeral: true });
    } catch {
      await interaction.reply({ content: "❌ No pude enviar el mensaje al usuario.", ephemeral: true });
    }
  }
});

// Login
client.login(process.env.TOKEN);
