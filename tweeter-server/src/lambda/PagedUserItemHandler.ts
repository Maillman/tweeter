import { PagedUserItemRequest, PagedUserItemResponse } from "tweeter-shared";

export const PagedUserItemHandler = async <D>(
  serviceMethod: (
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: D | null
  ) => Promise<[D[], boolean]>,
  request: PagedUserItemRequest<D>
): Promise<PagedUserItemResponse<D>> => {
  const [items, hasMore] = await serviceMethod(
    request.token,
    request.userAlias,
    request.pageSize,
    request.lastItem
  );
  return {
    success: true,
    message: null,
    items: items,
    hasMore: hasMore,
  };
};
