#!/usr/bin/env python3
"""
CloudQuery Airgap Package Creator for RunWhen Local

This script creates an airgap package containing all necessary CloudQuery plugins
and table information for offline installations.

Usage:
    python create_airgap_package.py --output /path/to/airgap/package
    python create_airgap_package.py --output ./airgap --platforms azure,aws
"""

import argparse
import sys
import os
import logging

# Add src directory to path to import airgap_support
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from indexers.airgap_support import create_airgap_package, CLOUDQUERY_PLUGINS

def main():
    parser = argparse.ArgumentParser(
        description="Create CloudQuery airgap package for RunWhen Local",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create package for all platforms
  python create_airgap_package.py --output ./airgap-package

  # Create package for specific platforms
  python create_airgap_package.py --output ./airgap-package --platforms azure,aws

  # Enable debug logging
  python create_airgap_package.py --output ./airgap-package --debug

Supported platforms: {}
        """.format(", ".join(CLOUDQUERY_PLUGINS.keys()))
    )
    
    parser.add_argument(
        "--output", "-o",
        required=True,
        help="Output directory for the airgap package"
    )
    
    parser.add_argument(
        "--platforms", "-p",
        help="Comma-separated list of platforms to include (default: all)"
    )
    
    parser.add_argument(
        "--debug", "-d",
        action="store_true",
        help="Enable debug logging"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.debug else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    
    # Parse platforms
    if args.platforms:
        platforms = [p.strip() for p in args.platforms.split(',')]
        # Validate platforms
        invalid_platforms = [p for p in platforms if p not in CLOUDQUERY_PLUGINS]
        if invalid_platforms:
            logger.error(f"Invalid platforms: {invalid_platforms}")
            logger.error(f"Supported platforms: {list(CLOUDQUERY_PLUGINS.keys())}")
            sys.exit(1)
    else:
        platforms = list(CLOUDQUERY_PLUGINS.keys())
    
    logger.info(f"Creating airgap package for platforms: {platforms}")
    logger.info(f"Output directory: {args.output}")
    
    # Check if output directory exists
    if os.path.exists(args.output):
        if os.listdir(args.output):
            response = input(f"Directory {args.output} is not empty. Continue? (y/N): ")
            if response.lower() != 'y':
                logger.info("Aborted by user")
                sys.exit(0)
    
    # Create airgap package
    try:
        success = create_airgap_package(args.output, platforms)
        if success:
            logger.info("Airgap package created successfully!")
            logger.info(f"Package location: {args.output}")
            logger.info(f"To install: sudo {args.output}/install_airgap.sh")
            logger.info("To use: Set CLOUDQUERY_AIRGAP_MODE=true in your environment")
        else:
            logger.error("Failed to create airgap package")
            sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error creating airgap package: {e}")
        if args.debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
