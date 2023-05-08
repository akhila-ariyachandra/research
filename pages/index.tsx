import axios from "axios";
import Head from "next/head";
import { type FC, useState } from "react";
import type {
  BasicMLFQResponse,
  MLMLFQResponse,
  EnhancedMLFQResponse,
} from "@/utils/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { formSchema, FormSchema } from "@/utils/schema";

const HomePage: FC = () => {
  const [basicResponseOne, setBasicResponseOne] =
    useState<BasicMLFQResponse>(null);
  const [basicResponseTwo, setBasicResponseTwo] =
    useState<BasicMLFQResponse>(null);
  const [basicResponseThree, setBasicResponseThree] =
    useState<BasicMLFQResponse>(null);
  const [mlResponse, setMlResponse] = useState<MLMLFQResponse>(null);
  const [enhancedResponse, setEnhancedResponse] =
    useState<EnhancedMLFQResponse>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recs: 1000,
    },
  });

  const basicMutationOne = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post<BasicMLFQResponse>("/api/mlfq/basic", {
        ...data,
        timeQuantums: [10000, 20000, 30000],
      });

      return response.data;
    },
    onSuccess: (data) => {
      setBasicResponseOne(data);
    },
  });
  const basicMutationTwo = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post<BasicMLFQResponse>("/api/mlfq/basic", {
        ...data,
        timeQuantums: [50000, 75000, 100000],
      });

      return response.data;
    },
    onSuccess: (data) => {
      setBasicResponseTwo(data);
    },
  });
  const basicMutationThree = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post<BasicMLFQResponse>("/api/mlfq/basic", {
        ...data,
        timeQuantums: [50000, 100000, 150000],
      });

      return response.data;
    },
    onSuccess: (data) => {
      setBasicResponseThree(data);
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
  const enhancedMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post<EnhancedMLFQResponse>(
        "/api/mlfq/enhanced",
        data
      );

      return response.data;
    },
    onSuccess: (data) => {
      setEnhancedResponse(data);
    },
  });

  const submit = async (formData: FormSchema) => {
    // Clear states
    setBasicResponseOne(null);
    setBasicResponseTwo(null);
    setBasicResponseThree(null);
    setMlResponse(null);
    setEnhancedResponse(null);

    basicMutationOne.mutate(formData);
    basicMutationTwo.mutate(formData);
    basicMutationThree.mutate(formData);
    mlMutation.mutate(formData);
    enhancedMutation.mutate(formData);
  };

  const data = [
    {
      name: "Basic MLFQ 1",
      "Average Turnaround Time": basicResponseOne?.avgTurnaroundTime ?? 0,
      "Average Response Time": basicResponseOne?.avgResponseTime ?? 0,
      "Number of Context Switches": basicResponseOne?.contextSwitches ?? 0,
    },
    {
      name: "Basic MLFQ 2",
      "Average Turnaround Time": basicResponseTwo?.avgTurnaroundTime ?? 0,
      "Average Response Time": basicResponseTwo?.avgResponseTime ?? 0,
      "Number of Context Switches": basicResponseTwo?.contextSwitches ?? 0,
    },
    {
      name: "Basic MLFQ 3",
      "Average Turnaround Time": basicResponseThree?.avgTurnaroundTime ?? 0,
      "Average Response Time": basicResponseThree?.avgResponseTime ?? 0,
      "Number of Context Switches": basicResponseThree?.contextSwitches ?? 0,
    },
    {
      name: "ML MLFQ",
      "Average Turnaround Time": mlResponse?.avgTurnaroundTime ?? 0,
      "Average Response Time": mlResponse?.avgResponseTime ?? 0,
      "Number of Context Switches": mlResponse?.contextSwitches ?? 0,
    },
    {
      name: "Enhanced MLFQ",
      "Average Turnaround Time": enhancedResponse?.avgTurnaroundTime ?? 0,
      "Average Response Time": enhancedResponse?.avgResponseTime ?? 0,
      "Number of Context Switches": enhancedResponse?.contextSwitches ?? 0,
    },
  ];

  return (
    <div className="container p-4">
      <Head>
        <title>MLFQ with Machine Learning</title>
      </Head>

      <form
        onSubmit={handleSubmit(submit)}
        className="flex flex-row items-center justify-center gap-2"
      >
        <label>Enter number of records: </label>

        <div>
          <input
            {...register("recs", { valueAsNumber: true, min: 10, max: 20000 })}
            type="number"
            className="input-bordered input"
          />
          {errors.recs?.message && <p>{errors.recs?.message}</p>}
        </div>

        <button type="submit" className="btn-primary btn">
          Run
        </button>
      </form>

      <table className="my-4 table w-full">
        <colgroup>
          <col width="20%" />
          <col width="40%" />
          <col width="40%" />
        </colgroup>

        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Statistics</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Basic MLFQ 1</td>
            <td>Multi-Layer Feedback Queue with Static Time Quantums</td>

            <td>
              <p>
                <strong>Average Turnaround Time: </strong>
                {basicResponseOne?.avgTurnaroundTime ?? "-"}
              </p>

              <p>
                <strong>Number of Context Switches: </strong>
                {basicResponseOne?.contextSwitches ?? "-"}
              </p>

              <p>
                <strong>Average Response Time: </strong>
                {basicResponseOne?.avgResponseTime ?? "-"}
              </p>

              <p>
                <strong>Time Quantums: </strong>
                {basicResponseOne?.timeQuantums.join(", ") ?? "-"}
              </p>
            </td>
          </tr>

          <tr>
            <td>Basic MLFQ 2</td>
            <td>Multi-Layer Feedback Queue with Static Time Quantums</td>

            <td>
              <p>
                <strong>Average Turnaround Time: </strong>
                {basicResponseTwo?.avgTurnaroundTime ?? "-"}
              </p>

              <p>
                <strong>Number of Context Switches: </strong>
                {basicResponseTwo?.contextSwitches ?? "-"}
              </p>

              <p>
                <strong>Average Response Time: </strong>
                {basicResponseTwo?.avgResponseTime ?? "-"}
              </p>

              <p>
                <strong>Time Quantums: </strong>
                {basicResponseTwo?.timeQuantums.join(", ") ?? "-"}
              </p>
            </td>
          </tr>

          <tr>
            <td>Basic MLFQ 3</td>
            <td>Multi-Layer Feedback Queue with Static Time Quantums</td>

            <td>
              <p>
                <strong>Average Turnaround Time: </strong>
                {basicResponseThree?.avgTurnaroundTime ?? "-"}
              </p>

              <p>
                <strong>Number of Context Switches: </strong>
                {basicResponseThree?.contextSwitches ?? "-"}
              </p>

              <p>
                <strong>Average Response Time: </strong>
                {basicResponseThree?.avgResponseTime ?? "-"}
              </p>

              <p>
                <strong>Time Quantums: </strong>
                {basicResponseThree?.timeQuantums.join(", ") ?? "-"}
              </p>
            </td>
          </tr>

          <tr>
            <td>ML MLFQ</td>
            <td>Multi-Layer Feedback Queue with Dynamic Time Quantums</td>

            <td>
              <p>
                <strong>Average Turnaround Time: </strong>
                {mlResponse?.avgTurnaroundTime ?? "-"}
              </p>

              <p>
                <strong>Number of Context Switches: </strong>
                {mlResponse?.contextSwitches ?? "-"}
              </p>

              <p>
                <strong>Average Response Time: </strong>
                {mlResponse?.avgResponseTime ?? "-"}
              </p>
            </td>
          </tr>

          <tr>
            <td>Enhanced MLFQ</td>
            <td>
              Multi-Layer Feedback Queue with Dynamic Time Quantums with Limits
            </td>

            <td>
              <p>
                <strong>Average Turnaround Time: </strong>
                {enhancedResponse?.avgTurnaroundTime ?? "-"}
              </p>

              <p>
                <strong>Number of Context Switches: </strong>
                {enhancedResponse?.contextSwitches ?? "-"}
              </p>

              <p>
                <strong>Average Response Time: </strong>
                {enhancedResponse?.avgResponseTime ?? "-"}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="grid h-[400px] w-full grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="Average Turnaround Time"
              fill="#8884d8"
              label="Average Turnaround Time"
            />
            <Bar
              dataKey="Average Response Time"
              fill="#82ca9d"
              label="Average Response Time"
            />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="Number of Context Switches"
              fill="#8884d8"
              label="Number of Context Switches"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HomePage;
