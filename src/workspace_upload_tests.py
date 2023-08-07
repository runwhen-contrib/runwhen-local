import base64
import datetime
import git
import io
import logging
import os
import shutil
import tarfile
import tempfile
from unittest import TestCase
from workspaceupload import MergeMode, upload_workspace
import workspaceupload
import yaml

TEST_WORKSPACE_NAME = "test-ws"
WORKSPACE_UPLOAD_TEST_DATA_DIRECTORY = "workspace-upload-test-data"

def read_file(path: str) -> str:
    with open(path, mode="r", encoding="utf8") as f:
        data = f.read()
        return data

MOCK_BUILD_DATE = datetime.datetime(2023, 7, 14, 5, 0, 0, 0)
MOCK_CURRENT_DATE = datetime.datetime(2023, 7, 14, 6, 0, 0, 0)

def mock_timestamp_func():
    return MOCK_CURRENT_DATE


class WorkspaceUploadTestCase(TestCase):

    def setUp(self):
        # TODO: Might be handy for developing/testing to support an environ
        # variable that specifies a directory to use as the remote repo
        # directory instead of using a temp directory. The idea would be
        # that in that case the repo directory would persist after the
        # end of the unit test where the contents can then be inspected
        # and, if deemed to be correct, copied over to be the expected
        # contents in the test data directory.
        self.temp_dir = tempfile.TemporaryDirectory()
        # Turn on debug logging for the upload code to facilitate debugging
        logging.getLogger('workspaceupload').setLevel(logging.DEBUG)
        workspaceupload.get_timestamp_func = mock_timestamp_func

    def tearDown(self):
        self.temp_dir.cleanup()

    def init_remote_workspace_repo_from_fixture(self, test_name, fixture_name):
        fixture_dir = None
        if test_name:
            # Check if the fixture exists in the test data directory
            test_dir = os.path.join(WORKSPACE_UPLOAD_TEST_DATA_DIRECTORY, test_name)
            fixture_dir = os.path.join(test_dir, fixture_name)
            if not os.path.exists(fixture_dir):
                fixture_dir = None
        if not fixture_dir:
            fixture_dir = os.path.join(WORKSPACE_UPLOAD_TEST_DATA_DIRECTORY, fixture_name)
        self.remote_workspace_repo_dir = os.path.join(self.temp_dir.name, fixture_name)
        self.remote_workspace_repo_url = f"file://{self.remote_workspace_repo_dir}"
        shutil.copytree(fixture_dir, self.remote_workspace_repo_dir)
        self.remote_workspace_repo = git.Repo.init(self.remote_workspace_repo_dir, b="main")
        self.remote_workspace_repo.git.add(all=True)
        self.remote_workspace_repo.index.commit("Initial commit")
        dummy_branch = self.remote_workspace_repo.create_head("dummy")
        dummy_branch.checkout()

    @staticmethod
    def resolve_test_dir(test_name, child_tree_name):
        parent_dir = "workspace-upload-test-data"
        if test_name:
            parent_dir = os.path.join(parent_dir, test_name)
        test_dir = os.path.join(parent_dir, child_tree_name)
        return test_dir

    @staticmethod
    def get_upload_archive_text(upload_contents_directory) -> str:
        tar_bytes = io.BytesIO()
        archive = tarfile.open(mode="x:gz", fileobj=tar_bytes)
        # We need to set the working directory to the output directory for the tarfile
        # to use the correct relative paths for the entries. Just to be safe we'll
        # save and restore the working directory even though, at least currently,
        # AFAIK nothing else is affected by the working directory.
        # FIXME: Is there some way to avoid changing the working directory like this?
        saved_working_directory = os.getcwd()
        os.chdir(upload_contents_directory)
        try:
            archive.add(".")
        finally:
            os.chdir(saved_working_directory)
        archive.close()
        archive_bytes = tar_bytes.getvalue()
        archive_text = base64.b64encode(archive_bytes).decode('utf-8')
        return archive_text

    def do_upload(self, test_name, upload_directory_name=None, merge_mode=MergeMode.KEEP_EXISTING):
        if not upload_directory_name:
            upload_directory_name = "upload-contents"
        upload_contents_dir = self.resolve_test_dir(test_name, upload_directory_name)
        upload_archive_text = self.get_upload_archive_text(upload_contents_dir)
        upload_data = {
            "buildDate": MOCK_BUILD_DATE,
            "mergeMode": merge_mode.value,
            "output": upload_archive_text,
            "message": "Test commit message",
        }
        upload_workspace(TEST_WORKSPACE_NAME, self.remote_workspace_repo_url, git.Repo.clone_from, upload_data)

    def compare_file_contents(self, actual_contents, expected_contents, actual_child_path):
        try:
            # Since, at least for the workspace builder testing, many/most of the files
            # we're comparing are yaml files, we make the yaml comparison a bit smarter.
            # It's inconvenient for yaml files to have to make the expected contents exactly
            # match the actual contents due to irrelevent inconsistencies in the way the yaml
            # was dumped, e.g. string quoting/wrapping, indentation, field ordering, etc.
            # So we roundtrip the data through a yaml deserialization/serialization to get
            # the data in a consistent format before comparing. A bit hacky, but it works.
            actual_data = yaml.safe_load(actual_contents)
            expected_data = yaml.safe_load(expected_contents)
            actual_contents = yaml.safe_dump(actual_data)
            expected_contents = yaml.safe_dump(expected_data)
        except yaml.parser.ParserError:
            # We'll hit here if the data was not parsable as yaml, in which case we just
            # continue and compare the text verbatim.
            pass
        # FIXME: Debugging code. Can remove eventually
        if actual_contents != expected_contents:
            x = 0
        self.assertEqual(expected_contents, actual_contents,
                         f"Unexpected file content for file: {actual_child_path}")

    def verify_equal_trees(self, actual_tree, expected_tree):
        actual_children = os.listdir(actual_tree)
        # The actual tree is a cloned git repo with a ".git" directory, which will
        # not exist in the expected tree, so we prune it here. To be completely
        # correct we should only do this at the top level of the actual tree, but
        # we're not going to have any real directory named ".git" so it doesn't
        # hurt to do it even for nested directory.
        if ".git" in actual_children:
            actual_children.remove(".git")
        expected_children = os.listdir(expected_tree)
        self.assertEqual(actual_children, expected_children)
        for child in actual_children:
            actual_child_path = os.path.join(actual_tree, child)
            expected_child_path = os.path.join(expected_tree, child)
            actual_is_dir = os.path.isdir(actual_child_path)
            expected_is_dir = os.path.isdir(expected_child_path)
            self.assertEqual(actual_is_dir, expected_is_dir)
            if actual_is_dir:
                self.verify_equal_trees(actual_child_path, expected_child_path)
            else:
                # FIXME: Seems like it might be fragile to require an exact match
                # comparison of the files rqther than deserializing from yaml and
                # comparing the resulting data. Otherwise we're dependent on how
                # the yaml module orders the fields when it serializes them.
                # I know that this was a problem in the java world, where the
                # order was based on the ordering of the buckets in a hash table
                # and was not consistent across different machines.
                # But maybe Python and/or the yaml module is guaranteed to be more reliable?
                # e.g. always outputting the fields in alphabetical order or something like that.
                # Need to investigate more...
                actual_contents = read_file(actual_child_path)
                expected_contents = read_file(expected_child_path)
                self.compare_file_contents(actual_contents, expected_contents, actual_child_path)

    def verify_repo_contents(self, test_name=None, expected_contents_name=None):
        # Construct the path to the directory containing the expected contents
        if not expected_contents_name:
            expected_contents_name = "expected-contents"
        expected_contents_dir = self.resolve_test_dir(test_name, expected_contents_name)
        # parent_dir = "workspace-upload-test-data"
        # if test_name:
        #     parent_dir = os.path.join(parent_dir, test_name)
        # if not expected_contents_name:
        #     expected_contents_name = "expected-contents"
        # expected_contents_dir = os.path.join(parent_dir, expected_contents_name)

        # The remote repo dir is on a dummy branch (i.e. which is required to be
        # able to perform merges to it), so we can't just use the contents of its
        # working directory. Instead, we clone the main branch of the repo to a
        # temp directory and verify the expected contents against that.
        with tempfile.TemporaryDirectory() as cloned_repo_dir:
            git.Repo.clone_from(self.remote_workspace_repo_url, cloned_repo_dir, b="main")
            self.verify_equal_trees(cloned_repo_dir, expected_contents_dir)
            pass

    def do_simple_test(self,
                        test_name,
                        fixture_name="initial-fixture",
                        upload_directory_name = None,
                        expected_contents_directory_name = None,
                        merge_mode = MergeMode.KEEP_EXISTING):
        self.init_remote_workspace_repo_from_fixture(test_name, fixture_name)
        self.do_upload(test_name, upload_directory_name, merge_mode)
        self.verify_repo_contents(test_name, expected_contents_directory_name )

    def test_initial_upload(self):
        self.do_simple_test("test-initial-upload", "empty-fixture")

    def test_newly_deleted_slx(self):
        self.do_simple_test("test-newly-deleted-slx")

    def test_tombstoned_slx(self):
        self.do_simple_test("test-tombstoned-slx")

    def test_renamed_slx_keep_existing(self):
        # This tests the case where an SLX was renamed by the user since the last
        # workspace upload. In that case the SLX name in the files in the code bundle
        # and any references to it in the workspace.yaml file will be the new name
        # but the name in the manifest file will still be the old name at the time
        # of the last upload.
        self.do_simple_test("test-renamed-slx-keep-existing", merge_mode=MergeMode.KEEP_EXISTING)

    def test_renamed_slx_keep_uploaded(self):
        # This tests the case where an SLX was renamed by the workspace builder,
        # either due to a change in the name shortening logic or else due to
        # a name customization by the user (once that's supported).
        self.do_simple_test("test-renamed-slx-keep-uploaded", merge_mode=MergeMode.KEEP_UPLOADED)

    def test_group_changed(self):
        # This tests that the merged content respects any manual changes to the groupings
        # that were made in the repo.
        self.do_simple_test("test-group-changes", merge_mode=MergeMode.KEEP_UPLOADED)

    def test_relationship_merge(self):
        # This tests that the merged content respects any manual changes to the groupings
        # that were made in the repo.
        self.do_simple_test("test-relationship-merge", merge_mode=MergeMode.KEEP_UPLOADED)