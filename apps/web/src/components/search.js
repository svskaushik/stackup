import { useState, useEffect } from 'react';
import {
  Button,
  Box,
  HStack,
  Image,
  Spacer,
  LinkBox,
  LinkOverlay,
  IconButton,
  InputGroup,
  Input,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { Routes } from '../config';

export const Search = ({ onSearch, onClear }) => {
  const [value, setValue] = useState('');
  const [debounce, setDebounce] = useState(false);

  useEffect(() => {
    if (!value) {
      debounce && onClear?.();
      !debounce && setDebounce(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const clearHandler = () => {
    setValue('');
  };

  const searchHandler = () => {
    value && onSearch?.(value);
  };

  const onChangeHandler = (ev) => {
    setValue(ev.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      searchHandler();
    }
  };

  return (
    <header>
      <Box borderBottomWidth="1px">
        <HStack spacing={['8px', '16px']} py="16px" px="16px" maxW="xl" margin="0 auto">
          <LinkBox>
            <NextLink href={Routes.HOME} passHref>
              <LinkOverlay>
                <Image
                  src="./mark-blue.png"
                  maxW="32px"
                  maxH="32px"
                  alt="stackup logo"
                  borderRadius="full"
                />
              </LinkOverlay>
            </NextLink>
          </LinkBox>

          <Spacer />

          <InputGroup>
            {value && (
              <InputLeftElement>
                <IconButton size="xs" onClick={clearHandler} icon={<CloseIcon />} />
              </InputLeftElement>
            )}

            <Input
              pr="88px"
              placeholder="Search for user"
              onChange={onChangeHandler}
              onKeyDown={handleKeyDown}
              value={value}
            />

            <InputRightElement width="80px">
              <Button size="sm" colorScheme="blue" onClick={searchHandler}>
                Search
              </Button>
            </InputRightElement>
          </InputGroup>
        </HStack>
      </Box>
    </header>
  );
};