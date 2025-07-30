import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyDBClusterCommand, se_ModifyDBClusterCommand } from "../protocols/Aws_query";
export { $Command };
export class ModifyDBClusterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "ModifyDBCluster", {})
    .n("RDSClient", "ModifyDBClusterCommand")
    .f(void 0, void 0)
    .ser(se_ModifyDBClusterCommand)
    .de(de_ModifyDBClusterCommand)
    .build() {
}
