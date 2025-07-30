import { getCrossRegionPresignedUrlPlugin } from "@aws-sdk/middleware-sdk-rds";
import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateDBInstanceReadReplicaCommand, se_CreateDBInstanceReadReplicaCommand } from "../protocols/Aws_query";
export { $Command };
export class CreateDBInstanceReadReplicaCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
        getCrossRegionPresignedUrlPlugin(config),
    ];
})
    .s("AmazonRDSv19", "CreateDBInstanceReadReplica", {})
    .n("RDSClient", "CreateDBInstanceReadReplicaCommand")
    .f(void 0, void 0)
    .ser(se_CreateDBInstanceReadReplicaCommand)
    .de(de_CreateDBInstanceReadReplicaCommand)
    .build() {
}
