#!/usr/bin/env python3
"""
Test script to verify the access control functionality
"""
import tempfile
import os
import sys

# Add the src directory to the path
sys.path.insert(0, '/home/runwhen/runwhen-local/src')

def test_has_read_write_access_tags():
    """Test the has_read_write_access_tags function"""
    from enrichers.generation_rules import has_read_write_access_tags
    
    # Test robot content with read-write access tag
    robot_content_read_write = """
*** Settings ***
Documentation    Test robot file with read-write access

*** Test Cases ***
Test Task With Read Write Access
    [Tags]    access:read-write
    Log    This task has read-write access
    
Test Task Without Access Tag
    Log    This task has no access tag
"""

    # Test robot content with only read-only access
    robot_content_read_only = """
*** Settings ***
Documentation    Test robot file with read-only access

*** Test Cases ***
Test Task With Read Only Access
    [Tags]    access:read-only
    Log    This task has read-only access
    
Test Task Without Access Tag
    Log    This task has no access tag
"""

    # Test robot content with no access tags
    robot_content_no_access = """
*** Settings ***
Documentation    Test robot file with no access tags

*** Test Cases ***
Test Task Without Access Tag
    Log    This task has no access tag
"""

    print("Testing robot content with read-write access...")
    result = has_read_write_access_tags(robot_content_read_write)
    print(f"Result: {result} (should be True)")
    assert result == True, "Should detect read-write access"
    
    print("Testing robot content with read-only access...")
    result = has_read_write_access_tags(robot_content_read_only)
    print(f"Result: {result} (should be False)")
    assert result == False, "Should not detect read-write access"
    
    print("Testing robot content with no access tags...")
    result = has_read_write_access_tags(robot_content_no_access)
    print(f"Result: {result} (should be False)")
    assert result == False, "Should not detect read-write access"
    
    print("All tests passed!")

if __name__ == "__main__":
    test_has_read_write_access_tags() 