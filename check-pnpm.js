if (!process.env['npm_config_user_agent'].startsWith('pnpm')) {
  console.error(`
////////////////////////////////////////////////////////////

    告别 yarn，请使用速度更快、体积更小的 pnpm
    pnpm 全局安装: \`npm install -g pnpm \`
    pnpm 安装项目依赖: \`pnpm install\`

////////////////////////////////////////////////////////////
  `);
  process.exit(-1);
}
