export interface NavItem {
  type: string
  /** Defines the class of the list. */
  className?: string
}

export interface NavImage extends NavItem {
  type: 'image'
  /** A path which contains the company icon/image */
  src: string
  /** A click handle which will redirect the user to the respectable webpage/path */
  onClick?: (event: React.MouseEvent<any>) => void
  /** Alternative text attribute */
  alt?: string
}

export interface NavHeader extends NavItem {
  type: 'header'
  /** Clinic/Hospital name */
  label: string
  /** Label color */
  color?: string
  /** A click handle which will redirect the user to the respectable webpage/path */
  onClick?: (event: React.MouseEvent<any>) => void
}

export interface NavLink extends NavItem {
  type: 'link'
  /** The link name */
  label: string | React.ReactElement
  /** Adds a top border to the link as a list divider */
  dividerAbove?: boolean
  /** Inserts an icon to the left of the link when a valid icon name is passed */
  icon?: string
  /** A click handle which will redirect the user to whenever it is clicked */
  onClick?: (event: React.MouseEvent<any>) => void
  /** Determines the href */
  href?: string
}

export interface NavIcon extends NavItem {
  type: 'icon'
  /** Label color */
  color?: string
  /** An icon name */
  name: string
  /** Size of icon */
  size?: string
  /** CSS class(es) for icon */
  iconClassName?: string
  /** Outline or filled version */
  outline?: boolean
  /** A click handle which will redirect the user to whenever it is clicked */
  onClick?: (event: React.MouseEvent<any>) => void
}

export interface NavLinkList extends NavItem {
  type: 'link-list'
  /** The link name */
  label: string
  /** An array to hold a dropdown Links */
  children: Array<NavLink>
  /** Align menu to the right of the nav */
  alignRight?: boolean
}

export interface NavLinkListIcon extends NavItem {
  type: 'link-list-icon'
  /** An icon name */
  name: string
  /** Size of icon */
  size?: string
  /** CSS class(es) for icon */
  iconClassName?: string
  /** Outline or filled version */
  outline?: boolean
  /** An array to hold a dropdown Links */
  children: Array<NavLink>
  /** Align menu to the right of the nav */
  alignRight?: boolean
}

export interface NavSearch extends NavItem {
  type: 'search'
  /** Defines the placeholder text. */
  placeholderText?: string
  /** Defines the button text. */
  buttonText?: string
  /** Defines the button variant. */
  buttonColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'light'
    | 'dark'
  /** Handles the on click search button event */
  onClickButton?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  /** Handles the on change search form event */
  onChangeInput?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Invoked as the user types to get the search suggestions */
  onSearch?: (query: string) => Promise<any[]>
}
