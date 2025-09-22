const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
require("dotenv").config();

// ===== Slash Commands =====
const commands = [
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario.")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario a banear").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del ban").setRequired(true))
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
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del warn").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("msg")
    .setDescription("Envía solicitud de ticket a un usuario. (Solo moderadores)")
    .addUserOption(opt => opt.setName("usuario").setDescription("Usuario destinatario").setRequired(true)),
].map(cmd => cmd.toJSON());

// ===== Registrar comandos =====
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("⏳ Borrando y registrando comandos...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Comandos listos.");
  } catch (err) {
    console.error(err);
  }
})();
