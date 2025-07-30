import { Command, Usage } from 'clipanion';
export default class EntryCommand extends Command {
    static usage: Usage;
    cwd: string;
    commandName: string;
    args: string[];
    execute(): Promise<number>;
}
