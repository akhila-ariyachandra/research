import axios from "axios";
import { type FC, useState } from "react";
import type { BasicMLFQResponse, MLMLFQResponse } from "@/utils/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { formSchema, FormSchema } from "@/utils/schema";

const HomePage: FC = () => {
  const [basicResponse, setBasicResponse] = useState<BasicMLFQResponse>(null);
  const [mlResponse, setMlResponse] = useState<MLMLFQResponse>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recs: 100,
    },
  });

  const basicMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post<BasicMLFQResponse>(
        "/api/mlfq/basic",
        data
      );

      return response.data;
    },
    onSuccess: (data) => {
      setBasicResponse(data);
    },
  });
  const mlMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post<MLMLFQResponse>("/api/mlfq/ml", data);

      return response.data;
    },
    onSuccess: (data) => {
      setMlResponse(data);
    },
  });

  const submit = async (formData: FormSchema) => {
    basicMutation.mutate(formData);
    mlMutation.mutate(formData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <input {...register("recs")} />
        {errors.recs?.message && <p>{errors.recs?.message}</p>}

        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-gray-300"
        >
          Run
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Statistics</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Basic MLFQ</td>
            <td>Multi-Layer Feedback Queue with Static Time Quantums</td>

            <td>
              {!!basicResponse && (
                <>
                  <p>
                    <strong>Average Turnaround Time: </strong>
                    {basicResponse.avgTurnaroundTime}
                  </p>

                  <p>
                    <strong>Number of Context Switches: </strong>
                    {basicResponse.contextSwitches}
                  </p>
                </>
              )}
            </td>
          </tr>

          <tr>
            <td>ML MLFQ</td>
            <td>Multi-Layer Feedback Queue with Dynamic Time Quantums</td>

            <td>
              {!!mlResponse && (
                <>
                  <p>
                    <strong>Average Turnaround Time: </strong>
                    {mlResponse.avgTurnaroundTime}
                  </p>

                  <p>
                    <strong>Number of Context Switches: </strong>
                    {mlResponse.contextSwitches}
                  </p>
                </>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
