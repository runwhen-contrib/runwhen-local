import { getCrossRegionPresignedUrlPlugin } from "@aws-sdk/middleware-sdk-rds";
import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_StartDBInstanceAutomatedBackupsReplicationCommand, se_StartDBInstanceAutomatedBackupsReplicationCommand, } from "../protocols/Aws_query";
export { $Command };
export class StartDBInstanceAutomatedBackupsReplicationCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
        getCrossRegionPresignedUrlPlugin(config),
    ];
})
    .s("AmazonRDSv19", "StartDBInstanceAutomatedBackupsReplication", {})
    .n("RDSClient", "StartDBInstanceAutomatedBackupsReplicationCommand")
    .f(void 0, void 0)
    .ser(se_StartDBInstanceAutomatedBackupsReplicationCommand)
    .de(de_StartDBInstanceAutomatedBackupsReplicationCommand)
    .build() {
}
