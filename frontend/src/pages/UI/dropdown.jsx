import { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import PropTypes from 'prop-types';

export default function DropdownMenu({ buttonLabel = "Select", items = [], onSelect }) {
  const [selectedLabel, setSelectedLabel] = useState(buttonLabel);

  // Handle selecting an item
  const handleSelect = (item) => {
    setSelectedLabel(item.label);
    if (onSelect) onSelect(item.value); // call callback with the value
  };

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <div>
        <MenuButton
          className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          {selectedLabel}
          <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
        </MenuButton>
      </div>

      <MenuItems
        className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
      >
        <div className="py-1">
          {items.map(({ type = 'button', label, value, href, onClick }, index) => (
            <MenuItem key={index}>
              {({ active }) => {
                const classes = `block w-full px-4 py-2 text-left text-sm ${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } cursor-pointer`;

                if (type === 'link') {
                  return (
                    <a href={href || '#'} className={classes} onClick={() => handleSelect({ label, value })}>
                      {label}
                    </a>
                  );
                } else if (type === 'button') {
                  return (
                    <button
                      type="button"
                      className={classes}
                      onClick={() => {
                        if (onClick) onClick();
                        handleSelect({ label, value });
                      }}
                    >
                      {label}
                    </button>
                  );
                } else if (type === 'form') {
                  return (
                    <form key={index} action={href} method="POST">
                      <button type="submit" className={classes}>
                        {label}
                      </button>
                    </form>
                  );
                }
                return null;
              }}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}

DropdownMenu.propTypes = {
  buttonLabel: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['link', 'button', 'form']),
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
      href: PropTypes.string,
      onClick: PropTypes.func,
    })
  ).isRequired,
  onSelect: PropTypes.func,
};
