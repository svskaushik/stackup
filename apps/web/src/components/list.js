import { Heading, Box, Spinner, useBreakpointValue } from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroll-component';

export const List = ({ items = [], hasMore, next, listHeading, emptyHeading, isInverse }) => {
  const heightOffset = useBreakpointValue({ base: '160px', sm: '200px' });

  return (
    <>
      {items.length > 0 && listHeading && (
        <Heading textAlign="left" size="sm">
          {listHeading}
        </Heading>
      )}
      <Box
        id="infinite-scroll-wrapper"
        mt="8px"
        overflow={isInverse ? 'auto' : undefined}
        display={isInverse ? 'flex' : undefined}
        height={isInverse ? `calc(100vh - ${heightOffset})` : undefined}
        flexDirection={isInverse ? 'column-reverse' : undefined}
        css={
          isInverse
            ? {
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }
            : undefined
        }
      >
        {(items.length > 0 && (
          <InfiniteScroll
            dataLength={items.length}
            next={next}
            hasMore={hasMore}
            loader={<Spinner mt="16px" color="blue.500" />}
            inverse={isInverse}
            style={isInverse ? { display: 'flex', flexDirection: 'column-reverse' } : undefined}
            scrollableTarget={isInverse ? 'infinite-scroll-wrapper' : undefined}
          >
            {items}
          </InfiniteScroll>
        )) || (
          <Heading size="md" px="16px" py="128px" color="gray.500" textAlign="center">
            {emptyHeading}
          </Heading>
        )}
      </Box>
    </>
  );
};