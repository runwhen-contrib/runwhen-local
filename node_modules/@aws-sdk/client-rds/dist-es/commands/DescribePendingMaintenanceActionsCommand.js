import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribePendingMaintenanceActionsCommand, se_DescribePendingMaintenanceActionsCommand, } from "../protocols/Aws_query";
export { $Command };
export class DescribePendingMaintenanceActionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribePendingMaintenanceActions", {})
    .n("RDSClient", "DescribePendingMaintenanceActionsCommand")
    .f(void 0, void 0)
    .ser(se_DescribePendingMaintenanceActionsCommand)
    .de(de_DescribePendingMaintenanceActionsCommand)
    .build() {
}
