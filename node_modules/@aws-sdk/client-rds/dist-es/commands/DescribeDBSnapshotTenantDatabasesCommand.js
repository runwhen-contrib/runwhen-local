import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeDBSnapshotTenantDatabasesCommand, se_DescribeDBSnapshotTenantDatabasesCommand, } from "../protocols/Aws_query";
export { $Command };
export class DescribeDBSnapshotTenantDatabasesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeDBSnapshotTenantDatabases", {})
    .n("RDSClient", "DescribeDBSnapshotTenantDatabasesCommand")
    .f(void 0, void 0)
    .ser(se_DescribeDBSnapshotTenantDatabasesCommand)
    .de(de_DescribeDBSnapshotTenantDatabasesCommand)
    .build() {
}
