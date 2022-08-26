export default {
	name: 'remove',
	async execute(interaction) {
		const player = interaction.client.music.players.get(interaction.guildId);
		if (!player) return interaction.respond([]);
		const focused = interaction.options.getFocused();
		return interaction.respond(
			player.queue.tracks
				.map((track, index) => ({ name: `${index + 1}. ${track.title}`, value: index + 1, title: track.title, requester: track.requester }))
				.filter(track => track.requester === interaction.user.id && track.title.toLowerCase().startsWith(focused.toLowerCase()))
				.map(track => ({ name: track.name, value: track.value })),
		);
	},
};
