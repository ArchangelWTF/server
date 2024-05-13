import { inject, injectable } from "tsyringe";
import { BotGeneratorHelper } from "@spt-aki/helpers/BotGeneratorHelper";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { WeightedRandomHelper } from "@spt-aki/helpers/WeightedRandomHelper";
import { Inventory } from "@spt-aki/models/eft/common/tables/IBotBase";
import { GenerationData } from "@spt-aki/models/eft/common/tables/IBotType";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { EquipmentSlots } from "@spt-aki/models/enums/EquipmentSlots";
import { ItemAddedResult } from "@spt-aki/models/enums/ItemAddedResult";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { LocalisationService } from "@spt-aki/services/LocalisationService";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";

@injectable()
export class BotWeaponGeneratorHelper
{
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
    )
    {}

    /**
     * Get a randomized number of bullets for a specific magazine
     * @param magCounts Weights of magazines
     * @param magTemplate magazine to generate bullet count for
     * @returns bullet count number
     */
    public getRandomizedBulletCount(magCounts: GenerationData, magTemplate: ITemplateItem): number
    {
        const randomizedMagazineCount = this.getRandomizedMagazineCount(magCounts);
        const parentItem = this.itemHelper.getItem(magTemplate._parent)[1];
        let chamberBulletCount = 0;
        if (this.magazineIsCylinderRelated(parentItem._name))
        {
            const firstSlotAmmoTpl = magTemplate._props.Cartridges[0]._props.filters[0].Filter[0];
            const ammoMaxStackSize = this.itemHelper.getItem(firstSlotAmmoTpl)[1]?._props?.StackMaxSize ?? 1;
            chamberBulletCount = ammoMaxStackSize === 1
                ? 1 // Rotating grenade launcher
                : magTemplate._props.Slots.length; // Shotguns/revolvers. We count the number of camoras as the _max_count of the magazine is 0
        }
        else if (parentItem._id === BaseClasses.UBGL)
        {
            // Underbarrel launchers can only have 1 chambered grenade
            chamberBulletCount = 1;
        }
        else
        {
            chamberBulletCount = magTemplate._props.Cartridges[0]._max_count;
        }

        /* Get the amount of bullets that would fit in the internal magazine
        * and multiply by how many magazines were supposed to be created */
        return chamberBulletCount * randomizedMagazineCount;
    }

    /**
     * Get a randomized count of magazines
     * @param magCounts min and max value returned value can be between
     * @returns numerical value of magazine count
     */
    public getRandomizedMagazineCount(magCounts: GenerationData): number
    {
        // const range = magCounts.max - magCounts.min;
        // return this.randomUtil.getBiasedRandomNumber(magCounts.min, magCounts.max, Math.round(range * 0.75), 4);

        return Number.parseInt(this.weightedRandomHelper.getWeightedValue(magCounts.weights));
    }

    /**
     * Is this magazine cylinder related (revolvers and grenade launchers)
     * @param magazineParentName the name of the magazines parent
     * @returns true if it is cylinder related
     */
    public magazineIsCylinderRelated(magazineParentName: string): boolean
    {
        return ["CylinderMagazine", "SpringDrivenCylinder"].includes(magazineParentName);
    }

    /**
     * Create a magazine using the parameters given
     * @param magazineTpl Tpl of the magazine to create
     * @param ammoTpl Ammo to add to magazine
     * @param magTemplate template object of magazine
     * @returns Item array
     */
    public createMagazineWithAmmo(magazineTpl: string, ammoTpl: string, magTemplate: ITemplateItem): Item[]
    {
        const magazine: Item[] = [{ _id: this.hashUtil.generate(), _tpl: magazineTpl }];

        this.itemHelper.fillMagazineWithCartridge(magazine, magTemplate, ammoTpl, 1);

        return magazine;
    }

    /**
     * Add a specific number of cartridges to a bots inventory (defaults to vest and pockets)
     * @param ammoTpl Ammo tpl to add to vest/pockets
     * @param cartridgeCount number of cartridges to add to vest/pockets
     * @param inventory bot inventory to add cartridges to
     * @param equipmentSlotsToAddTo what equipment slots should bullets be added into
     */
    public addAmmoIntoEquipmentSlots(
        ammoTpl: string,
        cartridgeCount: number,
        inventory: Inventory,
        equipmentSlotsToAddTo: EquipmentSlots[] = [EquipmentSlots.TACTICAL_VEST, EquipmentSlots.POCKETS],
    ): void
    {
        const ammoItems = this.itemHelper.splitStack({
            _id: this.hashUtil.generate(),
            _tpl: ammoTpl,
            upd: { StackObjectsCount: cartridgeCount },
        });

        for (const ammoItem of ammoItems)
        {
            const result = this.botGeneratorHelper.addItemWithChildrenToEquipmentSlot(
                equipmentSlotsToAddTo,
                ammoItem._id,
                ammoItem._tpl,
                [ammoItem],
                inventory,
            );

            if (result !== ItemAddedResult.SUCCESS)
            {
                this.logger.debug(`Unable to add ammo: ${ammoItem._tpl} to bot inventory, ${ItemAddedResult[result]}`);

                if (result === ItemAddedResult.NO_SPACE || result === ItemAddedResult.NO_CONTAINERS)
                {
                    // If there's no space for 1 stack or no containers to hold item, there's no space for the others
                    break;
                }
            }
        }
    }

    /**
     * Get a weapons default magazine template id
     * @param weaponTemplate weapon to get default magazine for
     * @returns tpl of magazine
     */
    public getWeaponsDefaultMagazineTpl(weaponTemplate: ITemplateItem): string
    {
        return weaponTemplate._props.defMagType;
    }
}
