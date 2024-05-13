import { inject, injectable } from "tsyringe";
import { SavedCommand } from "@spt-aki/helpers/Dialogue/Commando/SptCommands/GiveCommand/SavedCommand";
import { ISptCommand } from "@spt-aki/helpers/Dialogue/Commando/SptCommands/ISptCommand";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { PresetHelper } from "@spt-aki/helpers/PresetHelper";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { ISendMessageRequest } from "@spt-aki/models/eft/dialog/ISendMessageRequest";
import { IUserDialogInfo } from "@spt-aki/models/eft/profile/IAkiProfile";
import { SkillTypes } from "@spt-aki/models/enums/SkillTypes";
import { IProfileChangeEvent, ProfileChangeEventType } from "@spt-aki/models/spt/dialog/ISendMessageDetails";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { LocaleService } from "@spt-aki/services/LocaleService";
import { MailSendService } from "@spt-aki/services/MailSendService";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";

@injectable()
export class ProfileSptCommand implements ISptCommand
{
    /**
     * Regex to account for all these cases:
     * spt profile level 20
     * spt profile skill metabolism 10
     */
    private static commandRegex
        = /^spt profile (?<command>level|skill)((?<=.*skill) (?<skill>[\w]+)){0,1} (?<quantity>(?!0+)[0-9]+)$/;

    protected savedCommand: SavedCommand;

    public constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("PresetHelper") protected presetHelper: PresetHelper,
        @inject("MailSendService") protected mailSendService: MailSendService,
        @inject("LocaleService") protected localeService: LocaleService,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
    )
    {
    }

    public getCommand(): string
    {
        return "profile";
    }

    public getCommandHelp(): string
    {
        return "spt profile\n========\nSets the profile level or skill to the desired level through the message system.\n\n\tspt profile level [desired level]\n\t\tEx: spt profile level 20\n\n\tspt profile skill [skill name] [quantity]\n\t\tEx: spt profile skill metabolism 51";
    }

    public performAction(commandHandler: IUserDialogInfo, sessionId: string, request: ISendMessageRequest): string
    {
        if (!ProfileSptCommand.commandRegex.test(request.text))
        {
            this.mailSendService.sendUserMessageToPlayer(
                sessionId,
                commandHandler,
                "Invalid use of trader command. Use \"help\" for more information.",
            );
            return request.dialogId;
        }

        const result = ProfileSptCommand.commandRegex.exec(request.text);

        const command: string = result.groups.command;
        const skill: string = result.groups.skill;
        const quantity: number = +result.groups.quantity;

        let event: IProfileChangeEvent;
        switch (command)
        {
            case "level":
                if (quantity < 1 || quantity > this.profileHelper.getMaxLevel())
                {
                    this.mailSendService.sendUserMessageToPlayer(
                        sessionId,
                        commandHandler,
                        "Invalid use of profile command, the level was outside bounds: 1 to 70. Use \"help\" for more information.",
                    );
                    return request.dialogId;
                }
                event = this.handleLevelCommand(quantity);
                break;
            case "skill":
            {
                const enumSkill = Object.values(SkillTypes).find(t =>
                    t.toLocaleLowerCase() === skill.toLocaleLowerCase(),
                );

                if (enumSkill === undefined)
                {
                    this.mailSendService.sendUserMessageToPlayer(
                        sessionId,
                        commandHandler,
                        "Invalid use of profile command, the skill was not found. Use \"help\" for more information.",
                    );
                    return request.dialogId;
                }

                if (quantity < 0 || quantity > 51)
                {
                    this.mailSendService.sendUserMessageToPlayer(
                        sessionId,
                        commandHandler,
                        "Invalid use of profile command, the skill level was outside bounds: 1 to 51. Use \"help\" for more information.",
                    );
                    return request.dialogId;
                }
                event = this.handleSkillCommand(enumSkill, quantity);
                break;
            }
            default:
                this.mailSendService.sendUserMessageToPlayer(
                    sessionId,
                    commandHandler,
                    `If you are reading this, this is bad. Please report this to SPT staff with a screenshot. Command ${command}.`,
                );
                return request.dialogId;
        }

        this.mailSendService.sendSystemMessageToPlayer(
            sessionId,
            "A single ruble is being attached, required by BSG logic.",
            [{
                _id: this.hashUtil.generate(),
                _tpl: "5449016a4bdc2d6f028b456f",
                upd: { StackObjectsCount: 1 },
                parentId: this.hashUtil.generate(),
                slotId: "main",
            }],
            undefined,
            [event],
        );
        return request.dialogId;
    }

    protected handleSkillCommand(skill: string, level: number): IProfileChangeEvent
    {
        const event: IProfileChangeEvent = {
            _id: this.hashUtil.generate(),
            Type: ProfileChangeEventType.SKILL_POINTS,
            value: level * 100,
            entity: skill,
        };
        return event;
    }

    protected handleLevelCommand(level: number): IProfileChangeEvent
    {
        const exp = this.profileHelper.getExperience(level);
        const event: IProfileChangeEvent = {
            _id: this.hashUtil.generate(),
            Type: ProfileChangeEventType.PROFILE_LEVEL,
            value: exp,
            entity: null,
        };
        return event;
    }
}
