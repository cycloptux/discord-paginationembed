const { Client, MessageEmbed } = require('discord.js');
const PaginationEmbed = require('../');

const credentials = require('./credentials');

const bot = new Client();

const error = msg => {
  console.error(msg);

  process.exit(1);
};

const done = () => {
  console.log('Test done!');

  process.exit(0);
}

bot
  .on('ready', async () => {
    const channel = bot.channels.get(credentials.channel);

    if (!channel)
      error('Provided channel is not resolvable by the client.');

    console.log('Ready to test! Channel name:', channel.name, 'Channel ID:', channel.id);

    const {
      test,
      users,
      disabledNavigationEmojis,
      deleteOnTimeout
    } = credentials;

    if (test === 'embeds') {
      const embeds = [];

      for (let i = 0; i < 5; ++i)
        embeds.push(new MessageEmbed().addField('Page', i + 1));

      const Embeds = new PaginationEmbed.Embeds()
        .setArray(embeds)
        .setAuthorizedUsers(users)
        .setChannel(channel)
        .showPageIndicator(true)
        .setTitle('Test Title')
        .setDescription('Test Description')
        .setFooter('Test Footer Text')
        .setURL('https://gazmull.github.io/discord-paginationembed')
        .setColor(0xFF00AE)
        .setDeleteOnTimeout(deleteOnTimeout)
        .setDisabledNavigationEmojis(disabledNavigationEmojis)
        .setFunctionEmojis({
          '⬆': (_, instance) => {
            for (const embed of instance.array)
              embed.fields[0].value++;
          },
          '⬇': (_, instance) => {
            for (const embed of instance.array)
              embed.fields[0].value--;
          }
        })
        .on('start', () => console.log('Started!'))
        .on('finish', (user) => console.log(`Finished! User: ${user.username}`))
        .on('react', (user, emoji) => console.log(`Reacted! User: ${user.username} | Emoji: ${emoji.name} (${emoji.id})`))
        .on('expire', () => console.warn('Expired!'))
        .on('error', console.error);

      await Embeds.build();

      return done();
    } else if (test === 'fieldsembed') {
      const FieldsEmbed = new PaginationEmbed.FieldsEmbed()
        .setArray([{ name: 'John Doe' }, { name: 'Jane Doe' }])
        .setAuthorizedUsers(users)
        .setChannel(channel)
        .setElementsPerPage(1)
        .setPage(2)
        .showPageIndicator(true)
        .formatField('Name', i => i.name)
        .setDeleteOnTimeout(deleteOnTimeout)
        .setDisabledNavigationEmojis(disabledNavigationEmojis)
        .setFunctionEmojis({
          '🔄': (user, instance) => {
            const field = instance.embed.fields[0];

            if (field.name === 'Name')
              field.name = user.tag;
            else
              field.name = 'Name';
          }
        })
        .addFunctionEmoji('🅱', (_, instance) => {
          const field = instance.embed.fields[0];

          if (field.name.includes('🅱'))
            field.name = 'Name';
          else
            field.name = 'Na🅱e';
        });

      FieldsEmbed.embed
        .setColor(0xFF00AE)
        .setDescription('Test Description')
        .addField('Test Static Field', 'and its value');

      await FieldsEmbed.build();

      return done();
    } else error('Invalid pagination mode. Either choose \'embeds\' or \'fieldsembed\'');
  })
  .login(credentials.token);