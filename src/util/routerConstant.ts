export enum RouterRole {
  '/api/v1/business' = '/api/v1/business',
  '/api/v1/business-meeting-room' = '/api/v1/business-meeting-room',
  '/api/v1/business-meeting-room/:meetingRoomId' = '/api/v1/business-meeting-room/:meetingRoomId',
  '/api/v1/business-time' = '/api/v1/business-time',
  '/api/v1/business-time-list' = '/api/v1/business-time-list',
  '/api/v1/business-time-list/:timeListId' = '/api/v1/business-time-list/:timeListId',
  '/api/v1/business-vendor-field-init' = '/api/v1/business-vendor-field-init',
  '/api/v1/business-vendor-field' = '/api/v1/business-vendor-field',
  '/api/v1/business-vendor-field/:fieldId' = '/api/v1/business-vendor-field/:fieldId',
  '/api/v1/business-vendor-field/:fieldId/child/:fieldChildNodeId' = '/api/v1/business-vendor-field/:fieldId/child/:fieldChildNodeId',
  '/api/v1/business-vendor-field-all' = '/api/v1/business-vendor-field-all',
  '/api/v1/business-vendor-field-child/:fieldChildNodeId' = '/api/v1/business-vendor-field-child/:fieldChildNodeId',
  '/api/v1/business-vendor' = '/api/v1/business-vendor',
  '/api/v1/business-vendor/:vendorId' = '/api/v1/business-vendor/:vendorId',
  '/api/v1/business-vendor/:vendorId/information-type/:informationType' = '/api/v1/business-vendor/:vendorId/information-type/:informationType',
  '/api/v1/business-vendor-field-list/:informationTypeId' = '/api/v1/business-vendor-field-list/:informationTypeId',
  '/api/v1/business-vendor/:vendorId/manager/:managerId' = '/api/v1/business-vendor/:vendorId/manager/:managerId',
  '/api/v1/business-vendor/:vendorId/manager' = '/api/v1/business-vendor/:vendorId/manager',
  '/api/v1/business-code' = '/api/v1/business-code',
  '/api/v1/code/:category' = '/api/v1/code/:category',
  '/api/v1/token' = '/api/v1/token',
  '/api/v1/token-verify' = '/api/v1/token-verify',
  '/api/v1/user/vendor' = '/api/v1/user/vendor',
  '/api/v1/user/vendor/:vendorId' = '/api/v1/user/vendor/:vendorId',
  '/api/v1/user/vendor/:vendorId/verify-vendor-code' = '/api/v1/user/vendor/:vendorId/verify-vendor-code',
  '/api/v1/user/favorite' = '/api/v1/user/favorite',
  '/api/v1/user/favorite/:vendorId' = '/api/v1/user/favorite/:vendorId',
  '/api/v1/user/meeting-reservation/:blockId' = '/api/v1/user/meeting-reservation/:blockId',
  '/api/v1/user/schedule' = '/api/v1/user/schedule',
  '/api/v1/user/schedule/:date' = '/api/v1/user/schedule/:date',
  '/api/v1/user/filter' = '/api/v1/user/filter',
  '/api/v1/user/field' = '/api/v1/user/field',
  '/api/v1/user/business' = '/api/v1/user/business',
  '/api/v1/user/buyer' = '/api/v1/user/buyer',
}
