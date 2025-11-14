export class ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;

  constructor(code: number, data: T, message: string) {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static success<T>(data: T, message: string = '操作成功'): ApiResponse<T> {
    return new ApiResponse(200, data, message);
  }

  static error(message: string, code: number = 400): ApiResponse<null> {
    return new ApiResponse(code, null, message);
  }
}
