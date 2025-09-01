import React from 'react'
import {
  DocumentTextIcon,
  FolderIcon,
  FolderOpenIcon,
  TrashIcon,
  CodeBracketIcon,
  TagIcon,
  ClockIcon,
  FireIcon,
  HashtagIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface SidebarIconProps {
  name: string
  className?: string
  isExpanded?: boolean
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ name, className = "h-4 w-4", isExpanded }) => {
  const getIcon = () => {
    switch (name) {
      case 'document-text':
        return <DocumentTextIcon className={className} />
      case 'folder':
        return isExpanded ? <FolderOpenIcon className={className} /> : <FolderIcon className={className} />
      case 'folder-open':
        return <FolderOpenIcon className={className} />
      case 'trash':
        return <TrashIcon className={className} />
      case 'code-bracket':
        return <CodeBracketIcon className={className} />
      case 'tag':
        return <TagIcon className={className} />
      case 'clock':
        return <ClockIcon className={className} />
      case 'fire':
        return <FireIcon className={className} />
      case 'hashtag':
        return <HashtagIcon className={className} />
      case 'chevron-right':
        return <ChevronRightIcon className={className} />
      case 'chevron-down':
        return <ChevronDownIcon className={className} />
      case 'chevron':
        return isExpanded ? <ChevronDownIcon className={className} /> : <ChevronRightIcon className={className} />
      default:
        return <DocumentTextIcon className={className} />
    }
  }

  return <>{getIcon()}</>
}

export default SidebarIcon