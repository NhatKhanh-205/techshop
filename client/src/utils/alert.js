import Swal from "sweetalert2";

export const showSuccess = (text) => {
  Swal.fire({
    icon: "success",
    title: "Thành công",
    text,
    confirmButtonColor: "#ff4d4f"
  });
};

export const showError = (text) => {
  Swal.fire({
    icon: "error",
    title: "Lỗi",
    text,
    confirmButtonColor: "#ff4d4f"
  });
};

export const showConfirm = async (text) => {
  const result = await Swal.fire({
    title: "Bạn chắc chắn?",
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff4d4f",
    cancelButtonText: "Hủy",
    confirmButtonText: "Đồng ý"
  });

  return result.isConfirmed;
};