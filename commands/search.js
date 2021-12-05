const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const { checks } = require('../enums.js');
const { msToTime, msToTimeString } = require('../functions.js');
const { defaultColor } = require('../settings.json');

// credit: https://github.com/lavaclient/djs-v13-example/blob/main/src/commands/Play.ts

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search YouTube for a track.')
		.addStringOption(option =>
			option
				.setName('query')
				.setDescription('What to search for.')
				.setRequired(true)),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: [],
		bot: ['CONNECT', 'SPEAK'],
	},
	async execute(interaction) {
		await interaction.deferReply();
		const query = interaction.options.getString('query');
		let tracks = [];

		const results = await interaction.client.music.rest.loadTracks(`ytsearch:${query}`);

		switch (results.loadType) {
			case 'SEARCH_RESULT': {
				tracks = results.tracks;
				break;
			}
		}

		tracks = tracks.slice(0, 10);

		if (tracks.length <= 1) {
			await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setDescription('Try using the play command instead.')
						.setColor('DARK_RED'),
				],
			});
			return;
		}

		await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setDescription(tracks.map((track, index) => {
						const duration = msToTime(track.info.length);
						const durationString = track.info.isStream ? '∞' : msToTimeString(duration, true);
						return `\`${(index + 1).toString().padStart(tracks.length.toString().length, ' ')}.\` **[${track.info.title}](${track.info.uri})** \`[${durationString}]\``;
					}).join('\n'))
					.setColor(defaultColor),
			],
			components: [
				new MessageActionRow()
					.addComponents(
						new MessageSelectMenu()
							.setCustomId(`play_${interaction.user.id}`)
							.setPlaceholder('Pick track(s)')
							.addOptions(tracks.map((track, index) => {
								let label = `${index + 1}. ${track.info.title}`;
								if (label.length >= 100) {
									label = `${label.substring(0, 97)}...`;
								}
								return { label: label, description: track.info.author, value: track.info.identifier };
							}))
							.setMinValues(1)
							.setMaxValues(Math.min(tracks.length, 10)),
					),
				new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId(`cancel_${interaction.user.id}`)
							.setLabel('Cancel')
							.setStyle('DANGER'),
					),
			],
			ephemeral: true,
		});
	},
};