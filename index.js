const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  PermissionFlagsBits 
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// IDS FIJOS
const SANCTIONS_CHANNEL_ID = "1397738825609904242";
const TICKETS_CHANNEL_ID = "1390152260578967559";

// ====== CREAR COMANDOS ======
const commands = [
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a banear").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del baneo").setRequired(true))
    .addBooleanOption(opt => opt.setName("apelable").setDescription("¿Es apelable?").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a expulsar").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del kick").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advierte a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a advertir").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo de la advertencia").setRequired(true)),

  new SlashCommandBuilder()
    .setName("msg")
    .setDescription("Envía una solicitud de ticket a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario destinatario").setRequired(true))
].map(cmd => cmd.toJSON());

// ====== REGISTRAR COMANDOS ======
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("✅ Comandos registrados globalmente.");
  } catch (err) {
    console.error(err);
  }
})();

// ====== INTERACCIONES ======
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (["ban", "kick", "warn"].includes(commandName)) {
    const usuario = interaction.options.getUser("usuario");
    const miembro = interaction.guild.members.cache.get(usuario.id);
    const motivo = interaction.options.getString("motivo");
    const apelable = interaction.options.getBoolean("apelable");

    let embed = new EmbedBuilder()
      .setTitle(`🚍 ${commandName.toUpperCase()} | General Tomás Guido`)
      .setColor(commandName === "warn" ? "Yellow" : commandName === "kick" ? "Orange" : "Red")
      .addFields(
        { name: "👤 Usuario", value: usuario.tag, inline: true },
        { name: "🛠 Ejecutado por", value: interaction.user.tag, inline: true },
        { name: "📄 Motivo", value: motivo }
      )
      .setTimestamp();

    if (commandName === "ban") {
      embed.addFields({ name: "⚖️ Apelable", value: apelable ? "✅ Sí" : "❌ No" });
      await miembro?.ban({ reason: motivo }).catch(() => {});
    }
    if (commandName === "kick") {
      await miembro?.kick(motivo).catch(() => {});
    }

    // Enviar al canal de sanciones
    const canalSanciones = interaction.guild.channels.cache.get(SANCTIONS_CHANNEL_ID);
    if (canalSanciones) canalSanciones.send({ embeds: [embed] });

    // Enviar DM al usuario
    usuario.send({ embeds: [embed] }).catch(() => {});

    await interaction.reply({ content: `✅ ${commandName} ejecutado.`, ephemeral: true });
  }

  if (commandName === "msg") {
    const usuario = interaction.options.getUser("usuario");
    const embedMsg = new EmbedBuilder()
      .setTitle("📩 Solicitud de Ticket")
      .setDescription(`Has recibido una solicitud para crear un ticket en <#${TICKETS_CHANNEL_ID}>.\n👉 Dirígete al canal y abre un ticket.`)
      .setColor("Blue")
      .setTimestamp();

    usuario.send({ embeds: [embedMsg] }).catch(() => {});
    await interaction.reply({ content: `📨 Solicitud enviada a ${usuario.tag}.`, ephemeral: true });
  }
});

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
