const PREFIX = `[${new Date().toISOString()}]`;

function fmt(ctx: string, msg: unknown): string {
  const ts = new Date().toISOString();
  const m =
    typeof msg === "string"
      ? msg
      : msg instanceof Error
        ? `${msg.name}: ${msg.message}\n${(msg.stack ?? "").split("\n").slice(0, 3).join("\n")}`
        : JSON.stringify(msg);
  return `${ts} [${ctx}] ${m}`;
}

export const logger = {
  error(ctx: string, msg: unknown) {
    console.error(fmt(ctx, msg));
  },
  warn(ctx: string, msg: unknown) {
    console.warn(fmt(ctx, msg));
  },
  info(ctx: string, msg: unknown) {
    console.log(fmt(ctx, msg));
  },
};
