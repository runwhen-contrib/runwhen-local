#!/usr/bin/env python3
"""
K8s YAML Compatibility Validator

This script validates generated YAML files for K8s compatibility issues,
specifically focusing on tag value types and other common reconciliation problems.

Usage:
    python validate-yaml-compatibility.py <output_directory>
    python validate-yaml-compatibility.py basic/output
"""

import os
import sys
import yaml
import glob
from typing import List, Dict, Any
from pathlib import Path

class K8sYamlValidator:
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.validation_errors = []
        self.validation_warnings = []
        self.files_processed = 0
        
    def validate_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Validate a single YAML file for K8s compatibility issues."""
        issues = []
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Parse YAML content
            try:
                parsed_yaml = yaml.safe_load(content)
            except yaml.YAMLError as e:
                issues.append({
                    'type': 'error',
                    'category': 'yaml_syntax',
                    'message': f"YAML syntax error: {str(e)}",
                    'file': str(file_path.relative_to(self.output_dir))
                })
                return issues
            
            if not parsed_yaml or not isinstance(parsed_yaml, dict):
                return issues
            
            # Validate spec.tags for string values (the main issue we're solving)
            spec = parsed_yaml.get('spec', {})
            tags = spec.get('tags', [])
            
            if isinstance(tags, list):
                for i, tag in enumerate(tags):
                    if isinstance(tag, dict) and 'name' in tag and 'value' in tag:
                        tag_name = tag['name']
                        tag_value = tag['value']
                        
                        # Critical issue: non-string tag values
                        if not isinstance(tag_value, str):
                            issues.append({
                                'type': 'error',
                                'category': 'tag_value_type',
                                'message': f"Tag '{tag_name}' at index {i} has non-string value: {tag_value} (type: {type(tag_value).__name__}). This causes reconciliation errors in K8s CRDs.",
                                'file': str(file_path.relative_to(self.output_dir)),
                                'tag_name': tag_name,
                                'tag_value': tag_value,
                                'tag_index': i
                            })
                        
                        # Warning: potentially problematic tag names
                        if isinstance(tag_name, str):
                            # Check for forward slashes in non-prefixed tags
                            if '/' in tag_name and not tag_name.startswith('['):
                                issues.append({
                                    'type': 'warning',
                                    'category': 'tag_name_format',
                                    'message': f"Tag name '{tag_name}' contains '/' which may cause issues in some K8s contexts.",
                                    'file': str(file_path.relative_to(self.output_dir)),
                                    'tag_name': tag_name
                                })
                            
                            # Check for excessively long tag names
                            if len(tag_name) > 253:
                                issues.append({
                                    'type': 'error',
                                    'category': 'tag_name_length',
                                    'message': f"Tag name '{tag_name}' is {len(tag_name)} characters long, exceeding K8s label name limit of 253 characters.",
                                    'file': str(file_path.relative_to(self.output_dir)),
                                    'tag_name': tag_name
                                })
                        
                        # Warning: empty or whitespace-only values
                        if isinstance(tag_value, str) and not tag_value.strip():
                            issues.append({
                                'type': 'warning',
                                'category': 'tag_value_empty',
                                'message': f"Tag '{tag_name}' has empty or whitespace-only value.",
                                'file': str(file_path.relative_to(self.output_dir)),
                                'tag_name': tag_name
                            })
            
            # Validate metadata fields
            metadata = parsed_yaml.get('metadata', {})
            if metadata:
                name = metadata.get('name', '')
                if isinstance(name, str) and len(name) > 253:
                    issues.append({
                        'type': 'error',
                        'category': 'metadata_name_length',
                        'message': f"Metadata name '{name}' is {len(name)} characters long, exceeding K8s name limit of 253 characters.",
                        'file': str(file_path.relative_to(self.output_dir))
                    })
            
            # Check for reserved K8s fields
            reserved_fields = ['status', 'metadata.managedFields', 'metadata.generation']
            for field_path in reserved_fields:
                if self._has_nested_field(parsed_yaml, field_path):
                    issues.append({
                        'type': 'warning',
                        'category': 'reserved_field',
                        'message': f"Field '{field_path}' is typically managed by K8s controllers and may cause conflicts.",
                        'file': str(file_path.relative_to(self.output_dir))
                    })
            
        except Exception as e:
            issues.append({
                'type': 'error',
                'category': 'validation_error',
                'message': f"Unexpected validation error: {str(e)}",
                'file': str(file_path.relative_to(self.output_dir))
            })
        
        return issues
    
    def _has_nested_field(self, data: Dict[str, Any], field_path: str) -> bool:
        """Check if a nested field exists in the data."""
        current = data
        field_parts = field_path.split('.')
        
        for part in field_parts[:-1]:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return False
        
        return isinstance(current, dict) and field_parts[-1] in current
    
    def validate_directory(self) -> bool:
        """Validate all YAML files in the output directory."""
        if not self.output_dir.exists():
            print(f"❌ Output directory does not exist: {self.output_dir}")
            return False
        
        # Find all YAML files
        yaml_files = list(self.output_dir.glob('**/*.yaml')) + list(self.output_dir.glob('**/*.yml'))
        
        if not yaml_files:
            print(f"⚠️  No YAML files found in {self.output_dir}")
            return True
        
        print(f"🔍 Validating {len(yaml_files)} YAML files in {self.output_dir}")
        print()
        
        all_issues = []
        for yaml_file in yaml_files:
            issues = self.validate_file(yaml_file)
            all_issues.extend(issues)
            self.files_processed += 1
        
        # Categorize issues
        errors = [issue for issue in all_issues if issue['type'] == 'error']
        warnings = [issue for issue in all_issues if issue['type'] == 'warning']
        
        # Report results
        self._report_issues(errors, warnings)
        
        # Return True if no errors (warnings are acceptable)
        return len(errors) == 0
    
    def _report_issues(self, errors: List[Dict[str, Any]], warnings: List[Dict[str, Any]]):
        """Report validation issues in a structured format."""
        
        if not errors and not warnings:
            print("✅ All YAML files passed K8s compatibility validation!")
            print(f"   Processed {self.files_processed} files")
            return
        
        print("📋 K8s YAML Validation Report")
        print("=" * 50)
        
        if errors:
            print(f"\n❌ ERRORS ({len(errors)}):")
            print("-" * 20)
            
            # Group errors by category
            error_categories = {}
            for error in errors:
                category = error['category']
                if category not in error_categories:
                    error_categories[category] = []
                error_categories[category].append(error)
            
            for category, category_errors in error_categories.items():
                print(f"\n🔴 {category.replace('_', ' ').title()} ({len(category_errors)} issues):")
                for error in category_errors:
                    print(f"   • {error['file']}: {error['message']}")
        
        if warnings:
            print(f"\n⚠️  WARNINGS ({len(warnings)}):")
            print("-" * 22)
            
            # Group warnings by category
            warning_categories = {}
            for warning in warnings:
                category = warning['category']
                if category not in warning_categories:
                    warning_categories[category] = []
                warning_categories[category].append(warning)
            
            for category, category_warnings in warning_categories.items():
                print(f"\n🟡 {category.replace('_', ' ').title()} ({len(category_warnings)} issues):")
                for warning in category_warnings:
                    print(f"   • {warning['file']}: {warning['message']}")
        
        print(f"\n📊 Summary:")
        print(f"   Files processed: {self.files_processed}")
        print(f"   Errors: {len(errors)}")
        print(f"   Warnings: {len(warnings)}")
        
        if errors:
            print(f"\n❌ Validation FAILED - {len(errors)} errors must be fixed")
        else:
            print(f"\n✅ Validation PASSED - only warnings found")

def main():
    if len(sys.argv) != 2:
        print("Usage: python validate-yaml-compatibility.py <output_directory>")
        print("Example: python validate-yaml-compatibility.py basic/output")
        sys.exit(1)
    
    output_dir = sys.argv[1]
    validator = K8sYamlValidator(output_dir)
    
    success = validator.validate_directory()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main() 