import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuid } from "uuid";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AdminGuard } from "../auth/admin.guard";
import { getProductsUploadsDir } from "../uploads-path";

const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|webp|gif/;

@Controller("products")
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // Public — the storefront needs this to render the menu and stock state.
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  // Everything below is admin-only.
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }

  // Upload/replace a product's photo. Field name must be "image".
  @UseGuards(AdminGuard)
  @Post(":id/image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: getProductsUploadsDir(),
        filename: (_req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (_req, file, cb) => {
        const isAllowed = ALLOWED_IMAGE_TYPES.test(
          extname(file.originalname).toLowerCase()
        );
        if (!isAllowed) {
          cb(new BadRequestException("Only image files (jpg, png, webp, gif) are allowed"), false);
          return;
        }
        cb(null, true);
      },
    })
  )
  async uploadImage(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException("No image file was uploaded");
    const imageUrl = `/uploads/products/${file.filename}`;
    return this.productsService.update(id, { imageUrl });
  }
}
